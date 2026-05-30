import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Payment, PaymentMethod } from '@prisma/client';
import { format } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CommissionsService,
  type CommissionPaymentType,
} from '../commissions/commissions.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records an approved CASH collection at the branch: marks the payment as
   * paid by cash, then runs the shared approval flow.
   */
  recordCash(paymentId: string, approvedById: string): Promise<Payment> {
    return this.approve(paymentId, approvedById, 'CASH');
  }

  /**
   * Approves a payment (cash or transfer slip) and applies every documented
   * side effect atomically:
   *   - the payment becomes APPROVED
   *   - a down-payment approval decrements branch stock and activates the contract
   *   - a Sale commission (and Sale-Lead override, if any) is recorded
   *   - approving the final outstanding payment completes the contract
   */
  async approve(
    paymentId: string,
    approvedById: string,
    method?: PaymentMethod,
  ): Promise<Payment> {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { contract: true },
      });
      if (!payment) throw new NotFoundException('ไม่พบรายการชำระเงิน');
      if (payment.status === 'APPROVED') {
        throw new BadRequestException('รายการนี้อนุมัติไปแล้ว');
      }

      const now = new Date();
      const contract = payment.contract;

      // Issue a receipt number on approval: REC-YYYYMMDD-00001, sequential per
      // tenant per day (PRD). Unique per tenant via @@unique([tenantId, receiptNumber]).
      const datePart = format(now, 'yyyyMMdd');
      const issuedToday = await tx.payment.count({
        where: {
          tenantId: contract.tenantId,
          receiptNumber: { startsWith: `REC-${datePart}-` },
        },
      });
      const receiptNumber = `REC-${datePart}-${String(issuedToday + 1).padStart(5, '0')}`;

      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'APPROVED',
          method: method ?? payment.method,
          receiptNumber,
          paidAt: now,
          approvedById,
          approvedAt: now,
        },
      });

      // Down payment → release goods + activate the contract.
      if (payment.isDownPayment) {
        const stock = await tx.branchStock.findUnique({
          where: {
            branchId_productId: {
              branchId: contract.branchId,
              productId: contract.productId,
            },
          },
        });
        if (!stock || stock.quantity < 1) {
          throw new BadRequestException('สินค้าหมดสต็อกที่สาขานี้');
        }
        await tx.branchStock.update({
          where: {
            branchId_productId: {
              branchId: contract.branchId,
              productId: contract.productId,
            },
          },
          data: { quantity: stock.quantity - 1 },
        });
        await tx.contract.update({
          where: { id: contract.id },
          data: { status: 'ACTIVE', downPaymentPaid: true },
        });
      }

      // Commission on the real collection (ADR-0002).
      const paymentType = contract.paymentType as CommissionPaymentType;
      const collected = Number(updated.amount);

      const sale = await tx.user.findUnique({ where: { id: contract.saleId } });
      if (sale) {
        const saleRate = CommissionsService.rateFor(paymentType, {
          installmentRate: Number(sale.installmentRate),
          cashRate: Number(sale.cashRate),
        });
        const saleAmount = CommissionsService.commissionAmount(
          collected,
          saleRate,
        );
        if (saleAmount > 0) {
          await tx.commission.create({
            data: {
              tenantId: contract.tenantId,
              paymentId: updated.id,
              userId: sale.id,
              amount: saleAmount,
              type: 'SALE',
            },
          });
        }
      }

      // Sale-Lead override commission for the branch lead, if configured.
      const lead = await tx.user.findFirst({
        where: {
          tenantId: contract.tenantId,
          branchId: contract.branchId,
          role: 'SALE_LEAD',
          isActive: true,
        },
      });
      if (lead) {
        const leadAmount = CommissionsService.commissionAmount(
          collected,
          Number(lead.overrideRate),
        );
        if (leadAmount > 0) {
          await tx.commission.create({
            data: {
              tenantId: contract.tenantId,
              paymentId: updated.id,
              userId: lead.id,
              amount: leadAmount,
              type: 'SALE_LEAD',
            },
          });
        }
      }

      // Final outstanding payment approved → contract is completed.
      const remaining = await tx.payment.count({
        where: { contractId: contract.id, status: { not: 'APPROVED' } },
      });
      if (remaining === 0) {
        await tx.contract.update({
          where: { id: contract.id },
          data: { status: 'COMPLETED', warrantyActive: true },
        });
      }

      return updated;
    });
  }

  /**
   * Lists pending payments that are due on or before `asOf` (default today) —
   * the Sale "collect today" worklist. Down payments of pending contracts and
   * overdue installments of active contracts both surface here.
   */
  async listDue(
    tenantId: string,
    asOf: Date = new Date(),
  ): Promise<DuePaymentItem[]> {
    const endOfDay = new Date(asOf);
    endOfDay.setHours(23, 59, 59, 999);

    const payments = await this.prisma.payment.findMany({
      where: {
        tenantId,
        status: 'PENDING',
        dueDate: { lte: endOfDay },
        contract: {
          status: { in: ['PENDING_DOWN_PAYMENT', 'ACTIVE', 'DEFAULTED'] },
        },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        contract: {
          select: {
            id: true,
            customer: { select: { name: true, phone: true } },
            product: { select: { name: true } },
          },
        },
      },
    });

    const startOfToday = new Date(asOf);
    startOfToday.setHours(0, 0, 0, 0);

    return payments.map((p) => {
      const due = new Date(p.dueDate);
      const overdueDays = Math.max(
        0,
        Math.floor(
          (startOfToday.getTime() - due.setHours(0, 0, 0, 0)) / 86_400_000,
        ),
      );
      return {
        id: p.id,
        contractId: p.contract.id,
        customerName: p.contract.customer.name,
        customerPhone: p.contract.customer.phone,
        productName: p.contract.product.name,
        amount: Number(p.amount),
        dueDate: p.dueDate.toISOString(),
        isDownPayment: p.isDownPayment,
        overdueDays,
      };
    });
  }
}

export interface DuePaymentItem {
  id: string;
  contractId: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  amount: number;
  dueDate: string;
  isDownPayment: boolean;
  overdueDays: number;
}
