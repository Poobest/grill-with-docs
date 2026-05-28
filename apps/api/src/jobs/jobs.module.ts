import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { LateFeeProcessor } from './processors/late-fee.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'late-fee' }, { name: 'notification' }),
  ],
  providers: [LateFeeProcessor, NotificationProcessor, SchedulerService],
})
export class JobsModule {}
