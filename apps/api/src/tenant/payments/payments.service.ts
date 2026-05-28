import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContractStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
import { CommissionsService } from '../commissions/commissions.service';
import { RecordCashDto, SubmitSlipDto } from './dto/payment.dto';

type PrismaTx = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

type ContractSnapshot = {
  id: string;
  branchId: string;
  productId: string;
  paymentType: string;
  saleId: string;
  status: ContractStatus;
};

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
    private commissionsService: CommissionsService,
  ) {}

  async findAll(
    tenantId: string,
    filters: { contractId?: string; status?: PaymentStatus },
  ) {
    return this.prisma.payment.findMany({
      where: { tenantId, ...filters },
      include: {
        contract: {
          select: {
            id: true,
            paymentType: true,
            customer: { select: { id: true, name: true } },
          },
        },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: {
        contract: true,
        approvedBy: { select: { id: true, name: true } },
        commissions: {
          include: { user: { select: { id: true, name: true, role: true } } },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async recordCash(tenantId: string, approverId: string, dto: RecordCashDto) {
    const payment = await this.getPaymentWithContract(tenantId, dto.paymentId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in PENDING status');
    }

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.APPROVED,
          method: PaymentMethod.CASH,
          paidAt: now,
          approvedById: approverId,
          approvedAt: now,
        },
      });

      await this.handleApprovalSideEffects(
        tx,
        tenantId,
        { id: updated.id, isDownPayment: updated.isDownPayment, amount: updated.amount },
        payment.contract as ContractSnapshot,
      );

      return updated;
    });
  }

  async submitSlip(tenantId: string, dto: SubmitSlipDto) {
    const payment = await this.getPaymentWithContract(tenantId, dto.paymentId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in PENDING status');
    }
    if (payment.method === PaymentMethod.TRANSFER_SLIP) {
      throw new BadRequestException('Slip already submitted for this payment');
    }

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        method: PaymentMethod.TRANSFER_SLIP,
        slipImageUrl: dto.slipImageUrl,
      },
    });
  }

  async approve(tenantId: string, approverId: string, paymentId: string) {
    const payment = await this.getPaymentWithContract(tenantId, paymentId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not pending');
    }
    if (payment.method !== PaymentMethod.TRANSFER_SLIP) {
      throw new BadRequestException(
        'Only slip payments require approval; use POST /payments/cash for cash',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.APPROVED,
          paidAt: now,
          approvedById: approverId,
          approvedAt: now,
        },
      });

      await this.handleApprovalSideEffects(
        tx,
        tenantId,
        { id: updated.id, isDownPayment: updated.isDownPayment, amount: updated.amount },
        payment.contract as ContractSnapshot,
      );

      return updated;
    });
  }

  async reject(tenantId: string, paymentId: string) {
    const payment = await this.getPaymentWithContract(tenantId, paymentId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not pending');
    }

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.REJECTED },
    });
  }

  private async handleApprovalSideEffects(
    tx: PrismaTx,
    tenantId: string,
    payment: { id: string; isDownPayment: boolean; amount: unknown },
    contract: ContractSnapshot,
  ) {
    if (payment.isDownPayment) {
      await this.stockService.decrementOnDownPayment(
        tenantId,
        contract.branchId,
        contract.productId,
        tx,
      );
      await tx.contract.update({
        where: { id: contract.id },
        data: { status: ContractStatus.ACTIVE, downPaymentPaid: true },
      });
    }

    await this.commissionsService.calculateAndInsert(
      tx,
      tenantId,
      payment.id,
      payment.amount,
      contract.paymentType as import('@prisma/client').PaymentType,
      contract.saleId,
      contract.branchId,
    );

    // ถ้าไม่มี payment PENDING เหลือ → สัญญาเสร็จสิ้น
    const pendingCount = await tx.payment.count({
      where: { contractId: contract.id, status: PaymentStatus.PENDING },
    });

    if (pendingCount === 0 && contract.status !== ContractStatus.COMPLETED) {
      await tx.contract.update({
        where: { id: contract.id },
        data: { status: ContractStatus.COMPLETED, warrantyActive: true },
      });
    }
  }

  private async getPaymentWithContract(tenantId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
      include: {
        contract: {
          select: {
            id: true,
            branchId: true,
            productId: true,
            paymentType: true,
            saleId: true,
            status: true,
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (!payment.contract) throw new NotFoundException('Contract not found');
    return payment;
  }
}
