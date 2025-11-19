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
 * through various channels (Email, SMS, WhatsApp, Push)
 */
export class CreateNotificationDto {
  @ApiProperty({
    description: 'Unique identifier of the user receiving the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Type of notification being sent',
    enum: NotificationType,
    example: NotificationType.TRANSACTIONAL,
  })
  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @ApiProperty({
    description: 'Channel through which the notification will be delivered',
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({
    description: 'Main content/body of the notification message',
    example: 'Your order has been shipped! Tracking number: ABC123',
    minLength: 1,
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Subject line for email notifications (optional for other channels)',
    example: 'Order Update',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: 'Recipient address (email, phone number, device token, etc.)',
    example: 'user@example.com',
  })
  @IsString()
  recipient: string;

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

  @ApiPropertyOptional({
    description: 'Additional metadata for the notification (template variables, custom data, etc.)',
    example: { templateId: 'welcome-email', variables: { name: 'John' } },
    type: 'object',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
