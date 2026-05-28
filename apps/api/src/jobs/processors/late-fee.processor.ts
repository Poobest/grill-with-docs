import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import type { Job } from 'bull';
import { startOfDay } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('late-fee')
export class LateFeeProcessor {
  private readonly logger = new Logger(LateFeeProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('check-overdue')
  async handleCheckOverdue(job: Job) {
    this.logger.log('Running overdue payment check...');
    const today = startOfDay(new Date());

    const tenants = await this.prisma.tenant.findMany({
      where: { isActive: true },
      select: { id: true, defaultThreshold: true },
    });

    let totalMarked = 0;
    let totalSuspended = 0;

    for (const tenant of tenants) {
      const result = await this.processOverdueForTenant(
        tenant.id,
        tenant.defaultThreshold,
        today,
      );
      totalMarked += result.marked;
      totalSuspended += result.suspended;
    }

    this.logger.log(
      `Done: ${totalMarked} payments marked overdue, ${totalSuspended} customers auto-suspended`,
    );
    return { totalMarked, totalSuspended };
  }

  private async processOverdueForTenant(
    tenantId: string,
    threshold: number,
    today: Date,
  ) {
    const overduePayments = await this.prisma.payment.findMany({
      where: {
        tenantId,
        status: PaymentStatus.PENDING,
        dueDate: { lt: today },
      },
      select: {
        id: true,
        amount: true,
        contractId: true,
        contract: { select: { customerId: true } },
      },
    });

    if (overduePayments.length === 0) return { marked: 0, suspended: 0 };

    await this.prisma.$transaction(async (tx) => {
      for (const payment of overduePayments) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.OVERDUE },
        });
        await tx.lateFee.create({
          data: {
            tenantId,
            contractId: payment.contractId,
            amount: Number(payment.amount) * 0.05,
          },
        });
      }
    });

    // Auto-suspend check runs after transaction is committed
    const affectedCustomerIds = [
      ...new Set(overduePayments.map((p) => p.contract.customerId)),
    ];

    let suspended = 0;
    for (const customerId of affectedCustomerIds) {
      const overdueCount = await this.prisma.payment.count({
        where: {
          tenantId,
          status: PaymentStatus.OVERDUE,
          contract: { customerId },
        },
      });

      if (overdueCount >= threshold) {
        await this.prisma.customer.update({
          where: { id: customerId },
          data: { isSuspended: true },
        });
        suspended++;
      }
    }

    return { marked: overduePayments.length, suspended };
  }
}
