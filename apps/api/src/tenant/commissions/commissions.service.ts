import { Injectable } from '@nestjs/common';
import { CommissionType, PaymentType, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type PrismaTx = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  async calculateAndInsert(
    tx: PrismaTx,
    tenantId: string,
    paymentId: string,
    amount: unknown,
    paymentType: PaymentType,
    saleId: string,
    branchId: string,
  ) {
    const sale = await tx.user.findUnique({ where: { id: saleId } });
    if (!sale) return;

    const rate =
      paymentType === PaymentType.CASH
        ? sale.commissionRateCash
        : sale.commissionRateInstallment;

    await tx.commission.create({
      data: {
        tenantId,
        paymentId,
        userId: saleId,
        amount: (Number(amount) * Number(rate)) / 100,
        type: CommissionType.SALE_COMMISSION,
      },
    });

    const saleLead = await tx.user.findFirst({
      where: { tenantId, branchId, role: UserRole.SALE_LEAD, isActive: true },
    });

    if (saleLead) {
      const overrideRate =
        paymentType === PaymentType.CASH
          ? saleLead.commissionRateCash
          : saleLead.commissionRateInstallment;

      await tx.commission.create({
        data: {
          tenantId,
          paymentId,
          userId: saleLead.id,
          amount: (Number(amount) * Number(overrideRate)) / 100,
          type: CommissionType.OVERRIDE_COMMISSION,
        },
      });
    }
  }

  async findAll(tenantId: string, filters: { userId?: string }) {
    return this.prisma.commission.findMany({
      where: { tenantId, ...filters },
      include: {
        user: { select: { id: true, name: true, role: true } },
        payment: {
          select: {
            id: true,
            amount: true,
            paidAt: true,
            contract: { select: { id: true, paymentType: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
