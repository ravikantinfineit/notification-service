import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { QueueService } from '../queue/queue.service';
import { TransactionTrackingService } from '../transaction-tracking/transaction-tracking.service';
import { UserPreferencesService } from '../user-preferences/user-preferences.service';
import { CreateNotificationDto } from '../common/dto/create-notification.dto';
import { NotificationChannel, NotificationPriority } from '../common/enums/notification.enums';

/**
 * Notification Controller
 *
 * @class NotificationController
 * @description Handles all notification-related API endpoints including sending
 * single and bulk notifications through various channels (Email, SMS, WhatsApp, Push)
 *
 * @example
 * ```typescript
 * // Send a single notification
 * POST /notifications/send
 * {
 *   "userId": "uuid",
 *   "channel": "EMAIL",
 *   "content": "Your order has been shipped!",
 *   "recipient": "user@example.com"
 * }
 * ```
 */
@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly queueService: QueueService,
    private readonly trackingService: TransactionTrackingService,
    private readonly preferencesService: UserPreferencesService,
  ) {}

  /**
   * Send a single notification
   *
   * @method sendNotification
   * @description Queues a single notification for delivery through the specified channel.
   * The notification is added to the appropriate queue based on priority and processed asynchronously.
   * Returns a transaction ID that can be used to track the notification status.
   *
   * @param {CreateNotificationDto} dto - Notification data including user, channel, content, and recipient
   * @returns {Promise<Object>} Response object containing transaction ID, success status, channel, and priority
   *
   * @example
   * ```json
   * {
   *   "success": true,
   *   "transactionId": "abc-123-def-456",
   *   "message": "Notification queued successfully",
   *   "channel": "EMAIL",
   *   "priority": 2
   * }
   * ```
   */
  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Send a single notification',
    description:
      'Queues a notification for delivery. The notification will be processed asynchronously through the queue system based on priority.',
  })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 202,
    description: 'Notification successfully queued',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        transactionId: { type: 'string', example: 'abc-123-def-456' },
        message: { type: 'string', example: 'Notification queued successfully' },
        channel: { type: 'string', enum: ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH'] },
        priority: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendNotification(@Body() dto: CreateNotificationDto) {
    // Create transaction record
    const transactionId = await this.trackingService.createTransaction(dto.userId, dto);

    // Get user preferences to determine channel priority
    const preferredChannels = await this.preferencesService.getPreferredChannels(dto.userId);

    // If specific channel is requested, use it; otherwise use first preferred channel
    const channel = dto.channel || preferredChannels[0] || NotificationChannel.EMAIL;

    // Get channel priority from user preferences
    const channelPriority = await this.preferencesService.getChannelPriority(dto.userId, channel);

    // Determine notification priority
    const priority = dto.priority || channelPriority || NotificationPriority.MEDIUM;

    // Add to appropriate queue
    await this.queueService.addNotificationToQueue(
      {
        ...dto,
        channel,
        priority,
      },
      transactionId,
    );

    return {
      success: true,
      transactionId,
      message: 'Notification queued successfully',
      channel,
      priority,
    };
  }

  /**
   * Send multiple notifications in bulk
   *
   * @method sendBulkNotifications
   * @description Queues multiple notifications for delivery in a single request.
   * Each notification is processed independently and can succeed or fail individually.
   * Useful for sending notifications to multiple users or channels at once.
   *
   * @param {Object} dto - Object containing an array of notification DTOs
   * @param {CreateNotificationDto[]} dto.notifications - Array of notifications to send
   * @returns {Promise<Object>} Response object with total count, queued count, failed count, and individual results
   *
   * @example
   * ```json
   * {
   *   "success": true,
   *   "total": 10,
   *   "queued": 9,
   *   "failed": 1,
   *   "results": [...]
   * }
   * ```
   */
  @Post('send-bulk')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Send multiple notifications in bulk',
    description:
      'Queues multiple notifications for delivery in a single request. Each notification is processed independently.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: { $ref: '#/components/schemas/CreateNotificationDto' },
        },
      },
    },
  })
  @ApiResponse({
    status: 202,
    description: 'Bulk notifications queued',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        total: { type: 'number', example: 10 },
        queued: { type: 'number', example: 9 },
        failed: { type: 'number', example: 1 },
        results: { type: 'array' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async sendBulkNotifications(@Body() dto: { notifications: CreateNotificationDto[] }) {
    // Process notifications in parallel batches to optimize performance
    const BATCH_SIZE = 50; // Process 50 notifications at a time
    const results: Array<{
      success: boolean;
      transactionId?: string;
      userId: string;
      error?: string;
    }> = [];

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < dto.notifications.length; i += BATCH_SIZE) {
      const batch = dto.notifications.slice(i, i + BATCH_SIZE);

      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(async (notification) => {
          try {
            const transactionId = await this.trackingService.createTransaction(
              notification.userId,
              notification,
            );

            // Batch fetch user preferences to reduce database queries
            const [preferredChannels, channelPriority] = await Promise.all([
              this.preferencesService.getPreferredChannels(notification.userId),
              notification.channel
                ? this.preferencesService.getChannelPriority(notification.userId, notification.channel)
                : Promise.resolve(NotificationPriority.MEDIUM),
            ]);

            const channel =
              notification.channel || preferredChannels[0] || NotificationChannel.EMAIL;
            const priority =
              notification.priority || channelPriority || NotificationPriority.MEDIUM;

            await this.queueService.addNotificationToQueue(
              {
                ...notification,
                channel,
                priority,
              },
              transactionId,
            );

            return {
              success: true,
              transactionId,
              userId: notification.userId,
            };
          } catch (error) {
            return {
              success: false,
              userId: notification.userId,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        }),
      );

      // Convert Promise.allSettled results to our format
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          // This shouldn't happen with Promise.allSettled, but handle it anyway
          results.push({
            success: false,
            userId: 'unknown',
            error: result.reason?.message || 'Unknown error',
          });
        }
      });
    }

    const queued = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      success: true,
      total: dto.notifications.length,
      queued,
      failed,
      results,
    };
  }
}
