import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Queue } from 'bull';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue('late-fee') private lateFeeQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.registerIfAbsent(
      this.lateFeeQueue,
      'check-overdue',
      '0 1 * * *',
    );
    await this.registerIfAbsent(
      this.notificationQueue,
      'payment-reminder',
      '0 9 * * *',
    );
    this.logger.log('Repeatable jobs registered');
  }

  private async registerIfAbsent(queue: Queue, jobName: string, cron: string) {
    const existing = await queue.getRepeatableJobs();
    if (existing.some((j) => j.name === jobName)) return;
    await queue.add(jobName, {}, { repeat: { cron } });
    this.logger.log(`Registered: ${jobName} @ ${cron}`);
  }
}
