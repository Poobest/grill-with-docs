import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DashboardKpi {
  /** Total collected: sum of approved payment amounts. */
  totalCollected: number;
  /** Total commission earned across the tenant. */
  totalCommission: number;
  /** Contracts with at least one overdue unpaid installment, plus defaulted. */
  overdueContracts: number;
  /** Total stock units across all branches. */
  totalStock: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpi(tenantId: string, now: Date = new Date()): Promise<DashboardKpi> {
    const [collected, commission, stock, overdue] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { tenantId, status: 'APPROVED' },
        _sum: { amount: true },
      }),
      this.prisma.commission.aggregate({
        where: { tenantId },
        _sum: { amount: true },
      }),
      this.prisma.branchStock.aggregate({
        where: { tenantId },
        _sum: { quantity: true },
      }),
      // Contracts that are still open and have a past-due unpaid installment.
      this.prisma.contract.count({
        where: {
          tenantId,
          status: { in: ['ACTIVE', 'PENDING_DOWN_PAYMENT', 'DEFAULTED'] },
          payments: {
            some: { status: 'PENDING', dueDate: { lt: now } },
          },
        },
      }),
    ]);

    return {
      totalCollected: Number(collected._sum.amount ?? 0),
      totalCommission: Number(commission._sum.amount ?? 0),
      overdueContracts: overdue,
      totalStock: stock._sum.quantity ?? 0,
    };
  }
}
