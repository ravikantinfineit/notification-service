import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateNotificationDto } from '../common/dto/create-notification.dto';
import { NotificationPriority } from '../common/enums/notification.enums';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('notification-queue') private notificationQueue: Queue,
    @InjectQueue('priority-notification-queue') private priorityQueue: Queue,
    @InjectQueue('dead-letter-queue') private deadLetterQueue: Queue,
  ) {}

  async addNotificationToQueue(notification: CreateNotificationDto, transactionId: string) {
    const priority = notification.priority || NotificationPriority.LOW;
    const jobData = {
      ...notification,
      transactionId,
    };

    // Use priority queue for high and urgent notifications
    if (priority >= NotificationPriority.HIGH) {
      return await this.priorityQueue.add('send-notification', jobData, {
        priority,
        jobId: transactionId,
      });
    }

    // Use regular queue for low and medium priority
    return await this.notificationQueue.add('send-notification', jobData, {
      priority,
      jobId: transactionId,
    });
  }

  async addToDeadLetterQueue(
    notification: CreateNotificationDto,
    transactionId: string,
    reason: string,
  ) {
    return await this.deadLetterQueue.add(
      'dead-letter-notification',
      {
        ...notification,
        transactionId,
        reason,
      },
      {
        jobId: `dlq-${transactionId}`,
      },
    );
  }

  async getQueueStats() {
    const [regularWaiting, regularActive, regularCompleted, regularFailed] = await Promise.all([
      this.notificationQueue.getWaitingCount(),
      this.notificationQueue.getActiveCount(),
      this.notificationQueue.getCompletedCount(),
      this.notificationQueue.getFailedCount(),
    ]);

    const [priorityWaiting, priorityActive, priorityCompleted, priorityFailed] = await Promise.all([
      this.priorityQueue.getWaitingCount(),
      this.priorityQueue.getActiveCount(),
      this.priorityQueue.getCompletedCount(),
      this.priorityQueue.getFailedCount(),
    ]);

    const [dlqWaiting, dlqActive, dlqCompleted, dlqFailed] = await Promise.all([
      this.deadLetterQueue.getWaitingCount(),
      this.deadLetterQueue.getActiveCount(),
      this.deadLetterQueue.getCompletedCount(),
      this.deadLetterQueue.getFailedCount(),
    ]);

    return {
      regular: {
        waiting: regularWaiting,
        active: regularActive,
        completed: regularCompleted,
        failed: regularFailed,
      },
      priority: {
        waiting: priorityWaiting,
        active: priorityActive,
        completed: priorityCompleted,
        failed: priorityFailed,
      },
      deadLetter: {
        waiting: dlqWaiting,
        active: dlqActive,
        completed: dlqCompleted,
        failed: dlqFailed,
      },
    };
  }
}
