import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { TransactionTrackingService } from '../transaction-tracking/transaction-tracking.service';
import { NotificationChannel, NotificationStatus } from '../common/enums/notification.enums';

interface NotificationJobData {
  transactionId: string;
  userId: string;
  notificationType: string;
  channel: NotificationChannel;
  content: string;
  subject?: string;
  recipient: string;
  priority?: number;
  metadata?: Record<string, any>;
}

@Processor('priority-notification-queue', {
  concurrency: parseInt(process.env.PRIORITY_QUEUE_CONCURRENCY || '20'),
})
@Injectable()
export class PriorityNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(PriorityNotificationProcessor.name);

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    private readonly trackingService: TransactionTrackingService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<any> {
    const { transactionId, channel, recipient, content, subject, metadata } = job.data;

    this.logger.log(`Processing priority notification ${transactionId} via ${channel}`);

    try {
      await this.trackingService.updateStatus(transactionId, NotificationStatus.PROCESSING);

      let result;
      switch (channel) {
        case NotificationChannel.EMAIL:
          result = await this.notificationService.sendEmail(
            recipient,
            subject || 'Notification',
            content,
            metadata,
          );
          break;
        case NotificationChannel.SMS:
          result = await this.notificationService.sendSMS(recipient, content, metadata);
          break;
        case NotificationChannel.WHATSAPP:
          result = await this.notificationService.sendWhatsApp(recipient, content, metadata);
          break;
        case NotificationChannel.PUSH:
          result = await this.notificationService.sendPushNotification(
            recipient,
            content,
            subject,
            metadata,
          );
          break;
        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      await this.trackingService.updateStatus(transactionId, NotificationStatus.SENT, null, result);

      this.logger.log(`Priority notification ${transactionId} sent successfully`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send priority notification ${transactionId}: ${error.message}`,
        error.stack,
      );

      await this.trackingService.logError(transactionId, error, this.isRetryableError(error));

      const transaction = await this.trackingService.getTransaction(transactionId);
      if (transaction && transaction.retryCount >= transaction.maxRetries) {
        await this.trackingService.updateStatus(
          transactionId,
          NotificationStatus.DEAD_LETTER,
          error.message,
        );
      } else {
        await this.trackingService.updateStatus(
          transactionId,
          NotificationStatus.RETRY,
          error.message,
        );
      }

      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Priority job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Priority job ${job.id} failed: ${error.message}`);
  }

  private isRetryableError(error: any): boolean {
    if (
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.message?.includes('timeout') ||
      error.message?.includes('rate limit') ||
      error.statusCode === 429 ||
      error.statusCode === 503
    ) {
      return true;
    }

    if (
      error.statusCode === 401 ||
      error.statusCode === 403 ||
      error.statusCode === 400 ||
      error.message?.includes('invalid') ||
      error.message?.includes('not found')
    ) {
      return false;
    }

    return true;
  }
}
