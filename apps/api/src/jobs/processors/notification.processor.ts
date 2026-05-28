import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import type { Job } from 'bull';
import { addDays, startOfDay } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('payment-reminder')
  async handlePaymentReminder(job: Job) {
    const tomorrow = startOfDay(addDays(new Date(), 1));
    const dayAfter = startOfDay(addDays(new Date(), 2));

    const upcomingPayments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING,
        isDownPayment: false,
        dueDate: { gte: tomorrow, lt: dayAfter },
      },
      select: {
        id: true,
        amount: true,
        dueDate: true,
        contract: {
          select: {
            customer: { select: { name: true, lineUserId: true } },
            product: { select: { name: true } },
          },
        },
      },
    });

    this.logger.log(
      `Payment reminder: ${upcomingPayments.length} payments due tomorrow`,
    );

    for (const payment of upcomingPayments) {
      const { customer, product } = payment.contract;
      if (!customer.lineUserId) continue;

      // Phase 7: replace with LINE Messaging API call
      this.logger.log(
        `[LINE pending] ${customer.name} (${customer.lineUserId}) — ` +
          `${product.name} ฿${payment.amount} due tomorrow`,
      );
    }
  }
}
