import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationStatus,
  NotificationChannel,
  NotificationType,
  ErrorType,
} from '../common/enums/notification.enums';
import { CreateNotificationDto } from '../common/dto/create-notification.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Transaction Tracking Service
 *
 * @class TransactionTrackingService
 * @description Service responsible for tracking all notification transactions,
 * managing their lifecycle states, logging errors, and providing analytics.
 * Maintains a complete audit trail of all notification attempts and outcomes.
 *
 * @example
 * ```typescript
 * // Create a new transaction
 * const transactionId = await trackingService.createTransaction(userId, notificationDto);
 *
 * // Update transaction status
 * await trackingService.updateStatus(transactionId, NotificationStatus.SENT);
 *
 * // Log an error
 * await trackingService.logError(transactionId, error, true);
 * ```
 */
@Injectable()
export class TransactionTrackingService {
  private readonly logger = new Logger(TransactionTrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new notification transaction record
   *
   * @method createTransaction
   * @description Creates a new transaction record in the database with PENDING status.
   * Generates a unique transaction ID (UUID) that can be used to track the notification.
   *
   * @param {string} userId - Unique identifier of the user receiving the notification
   * @param {CreateNotificationDto} notification - Notification data to track
   * @returns {Promise<string>} Unique transaction ID (UUID)
   */
  async createTransaction(userId: string, notification: CreateNotificationDto): Promise<string> {
    const transactionId = uuidv4();

    await this.prisma.notificationTransaction.create({
      data: {
        transactionId,
        userId,
        notificationType: notification.notificationType,
        channel: notification.channel,
        status: NotificationStatus.PENDING,
        content: notification.content,
        subject: notification.subject,
        recipient: notification.recipient,
        priority: notification.priority || 1,
        metadata: notification.metadata || {},
        maxRetries: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
      },
    });

    this.logger.log(`Created transaction ${transactionId} for user ${userId}`);
    return transactionId;
  }

  /**
   * Update the status of a notification transaction
   *
   * @method updateStatus
   * @description Updates the status of a notification transaction and records
   * relevant timestamps (sentAt, failedAt) based on the new status.
   * Also handles retry count increments and provider response storage.
   *
   * @param {string} transactionId - Unique transaction identifier
   * @param {NotificationStatus} status - New status to set
   * @param {string} [failureReason] - Optional reason for failure (if status is FAILED or DEAD_LETTER)
   * @param {any} [providerResponse] - Optional provider response to store in metadata
   * @returns {Promise<void>}
   */
  async updateStatus(
    transactionId: string,
    status: NotificationStatus,
    failureReason?: string,
    providerResponse?: any,
  ) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === NotificationStatus.SENT) {
      updateData.sentAt = new Date();
      updateData.failureReason = null;
    } else if (status === NotificationStatus.FAILED || status === NotificationStatus.DEAD_LETTER) {
      updateData.failedAt = new Date();
      if (failureReason) {
        updateData.failureReason = failureReason;
      }
    } else if (status === NotificationStatus.RETRY) {
      updateData.retryCount = {
        increment: 1,
      };
    }

    if (providerResponse) {
      const existing = await this.prisma.notificationTransaction.findUnique({
        where: { transactionId },
        select: { metadata: true },
      });

      updateData.metadata = {
        ...((existing?.metadata as Record<string, any>) || {}),
        providerResponse,
      };
    }

    await this.prisma.notificationTransaction.update({
      where: { transactionId },
      data: updateData,
    });

    this.logger.log(`Updated transaction ${transactionId} status to ${status}`);
  }

  /**
   * Log an error for a notification transaction
   *
   * @method logError
   * @description Creates an error log entry for a transaction, categorizing
   * the error type and determining if it's retryable. Stores error details,
   * stack traces, and provider responses for debugging and analysis.
   *
   * @param {string} transactionId - Unique transaction identifier
   * @param {any} error - Error object containing error details
   * @param {boolean} [retryable=true] - Whether the error is retryable
   * @returns {Promise<void>}
   */
  async logError(transactionId: string, error: any, retryable: boolean = true) {
    const errorType = this.determineErrorType(error, retryable);

    await this.prisma.errorLog.create({
      data: {
        transactionId,
        errorType,
        errorMessage: error.message || 'Unknown error',
        errorStack: error.stack,
        errorCode: error.code || error.statusCode?.toString(),
        retryable,
        providerResponse: error.response || error.body || null,
      },
    });

    this.logger.error(
      `Logged error for transaction ${transactionId}: ${errorType} - ${error.message}`,
    );
  }

  async getTransaction(transactionId: string) {
    return await this.prisma.notificationTransaction.findUnique({
      where: { transactionId },
      include: {
        errorLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getTransactionsByUser(userId: string, limit: number = 50, offset: number = 0) {
    return await this.prisma.notificationTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        errorLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Get last 5 errors
        },
      },
    });
  }

  async getTransactionsByStatus(
    status: NotificationStatus,
    limit: number = 100,
    offset: number = 0,
  ) {
    return await this.prisma.notificationTransaction.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        errorLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getFailedTransactions(limit: number = 100, offset: number = 0) {
    return await this.prisma.notificationTransaction.findMany({
      where: {
        status: {
          in: [NotificationStatus.FAILED, NotificationStatus.DEAD_LETTER],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        errorLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getErrorLogs(transactionId: string) {
    return await this.prisma.errorLog.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStatistics(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, pending, sent, failed, retry, deadLetter] = await Promise.all([
      this.prisma.notificationTransaction.count({ where }),
      this.prisma.notificationTransaction.count({
        where: { ...where, status: NotificationStatus.PENDING },
      }),
      this.prisma.notificationTransaction.count({
        where: { ...where, status: NotificationStatus.SENT },
      }),
      this.prisma.notificationTransaction.count({
        where: { ...where, status: NotificationStatus.FAILED },
      }),
      this.prisma.notificationTransaction.count({
        where: { ...where, status: NotificationStatus.RETRY },
      }),
      this.prisma.notificationTransaction.count({
        where: { ...where, status: NotificationStatus.DEAD_LETTER },
      }),
    ]);

    return {
      total,
      pending,
      sent,
      failed,
      retry,
      deadLetter,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0.00',
    };
  }

  private determineErrorType(error: any, retryable: boolean): ErrorType {
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      return ErrorType.NETWORK_ERROR;
    }
    if (error.statusCode === 429) {
      return ErrorType.RATE_LIMIT;
    }
    if (error.statusCode === 401 || error.statusCode === 403) {
      return ErrorType.AUTHENTICATION_ERROR;
    }
    if (error.statusCode === 400 || error.message?.includes('invalid')) {
      return ErrorType.INVALID_DATA;
    }
    if (error.provider) {
      return ErrorType.PROVIDER_ERROR;
    }
    return retryable ? ErrorType.RETRYABLE : ErrorType.NON_RETRYABLE;
  }
}
