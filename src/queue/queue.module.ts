import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { NotificationProcessor } from './notification.processor';
import { PriorityNotificationProcessor } from './priority-notification.processor';
import { NotificationModule } from '../notification/notification.module';
import { TransactionTrackingModule } from '../transaction-tracking/transaction-tracking.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification-queue',
      defaultJobOptions: {
        attempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
        backoff: {
          type: 'exponential',
          delay: parseInt(process.env.RETRY_DELAY_MS || '5000'),
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    }),
    BullModule.registerQueue({
      name: 'priority-notification-queue',
      defaultJobOptions: {
        attempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
        backoff: {
          type: 'exponential',
          delay: parseInt(process.env.RETRY_DELAY_MS || '5000'),
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
        },
      },
    }),
    BullModule.registerQueue({
      name: 'dead-letter-queue',
      defaultJobOptions: {
        attempts: 1, // No retries in dead letter queue
        removeOnComplete: false,
        removeOnFail: false,
      },
    }),
    forwardRef(() => NotificationModule),
    TransactionTrackingModule,
  ],
  providers: [QueueService, NotificationProcessor, PriorityNotificationProcessor],
  exports: [QueueService],
})
export class QueueModule {}
