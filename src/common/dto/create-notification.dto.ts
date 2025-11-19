import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsNumber,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../enums/notification.enums';

/**
 * Data Transfer Object for creating a notification
 *
 * @class CreateNotificationDto
 * @description Contains all required and optional fields for sending a notification
 * through various channels (Email, SMS, WhatsApp, Push). This DTO is used to queue
 * notifications for asynchronous processing through the notification service.
 *
 * @example
 * ```typescript
 * const notification: CreateNotificationDto = {
 *   userId: '123e4567-e89b-12d3-a456-426614174000',
 *   notificationType: NotificationType.TRANSACTIONAL,
 *   channel: NotificationChannel.EMAIL,
 *   content: 'Your order has been shipped!',
 *   subject: 'Order Update',
 *   recipient: 'user@example.com',
 *   priority: NotificationPriority.MEDIUM,
 *   metadata: { orderId: '12345' }
 * };
 * ```
 */
export class CreateNotificationDto {
  /**
   * Unique identifier of the user receiving the notification
   *
   * @type {string}
   * @description UUID format identifier for the user who will receive this notification.
   * This is used to fetch user preferences and track notification history.
   *
   * @example '123e4567-e89b-12d3-a456-426614174000'
   * @format uuid
   * @required
   */
  @ApiProperty({
    description: 'Unique identifier of the user receiving the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  userId: string;

  /**
   * Type of notification being sent
   *
   * @type {NotificationType}
   * @description Categorizes the notification based on its purpose. Used for analytics,
   * filtering, and applying different processing rules.
   *
   * @example NotificationType.TRANSACTIONAL
   * @enum NotificationType
   * @required
   * @see NotificationType
   */
  @ApiProperty({
    description: 'Type of notification being sent',
    enum: NotificationType,
    example: NotificationType.TRANSACTIONAL,
  })
  @IsEnum(NotificationType)
  notificationType: NotificationType;

  /**
   * Channel through which the notification will be delivered
   *
   * @type {NotificationChannel}
   * @description Specifies the delivery channel for the notification. If not provided,
   * the system will use the user's preferred channel based on their preferences.
   *
   * @example NotificationChannel.EMAIL
   * @enum NotificationChannel
   * @required
   * @see NotificationChannel
   */
  @ApiProperty({
    description: 'Channel through which the notification will be delivered',
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  /**
   * Main content/body of the notification message
   *
   * @type {string}
   * @description The actual message content that will be sent to the recipient.
   * For email, this can be plain text or HTML. For SMS/WhatsApp, this is the text message.
   * For push notifications, this is the notification body.
   *
   * @example 'Your order has been shipped! Tracking number: ABC123'
   * @minLength 1
   * @required
   */
  @ApiProperty({
    description: 'Main content/body of the notification message',
    example: 'Your order has been shipped! Tracking number: ABC123',
    minLength: 1,
  })
  @IsString()
  content: string;

  /**
   * Subject line for email notifications
   *
   * @type {string}
   * @description Optional subject line for email notifications. For other channels,
   * this may be used as a title or header. If not provided for emails, a default
   * subject will be used.
   *
   * @example 'Order Update'
   * @optional
   */
  @ApiPropertyOptional({
    description: 'Subject line for email notifications (optional for other channels)',
    example: 'Order Update',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  /**
   * Recipient address for the notification
   *
   * @type {string}
   * @description The recipient's contact information. Format depends on the channel:
   * - Email: email address (e.g., 'user@example.com')
   * - SMS/WhatsApp: phone number in E.164 format (e.g., '+1234567890')
   * - Push: device token or user identifier
   *
   * @example 'user@example.com' or '+1234567890'
   * @required
   */
  @ApiProperty({
    description: 'Recipient address (email, phone number, device token, etc.)',
    example: 'user@example.com',
  })
  @IsString()
  recipient: string;

  /**
   * Priority level of the notification
   *
   * @type {NotificationPriority}
   * @description Determines the processing priority and queue selection:
   * - 1 (LOW): Standard priority, processed in regular queue
   * - 2 (MEDIUM): Default priority for most notifications
   * - 3 (HIGH): High priority, processed in priority queue
   * - 4 (URGENT): Urgent priority, fastest processing
   *
   * If not provided, the system will use the user's channel priority preference.
   *
   * @example NotificationPriority.MEDIUM
   * @enum NotificationPriority
   * @minimum 1
   * @maximum 4
   * @default NotificationPriority.MEDIUM
   * @optional
   * @see NotificationPriority
   */
  @ApiPropertyOptional({
    description: 'Priority level of the notification (1=Low, 2=Medium, 3=High, 4=Urgent)',
    enum: NotificationPriority,
    example: NotificationPriority.MEDIUM,
    minimum: 1,
    maximum: 4,
    default: NotificationPriority.MEDIUM,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  priority?: NotificationPriority;

  /**
   * Additional metadata for the notification
   *
   * @type {Record<string, any>}
   * @description Optional metadata object that can contain:
   * - Template variables for dynamic content
   * - Template ID for template-based notifications
   * - Custom data for provider-specific features
   * - Attachments information (for emails)
   * - Deep linking URLs (for push notifications)
   *
   * @example { templateId: 'welcome-email', variables: { name: 'John', orderId: '12345' } }
   * @optional
   */
  @ApiPropertyOptional({
    description: 'Additional metadata for the notification (template variables, custom data, etc.)',
    example: { templateId: 'welcome-email', variables: { name: 'John' } },
    type: 'object',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
