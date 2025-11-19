import { IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for updating user notification preferences
 *
 * @class UpdatePreferencesDto
 * @description Allows users to configure which notification channels are enabled
 * and set priority levels for each channel. All fields are optional, allowing
 * partial updates to user preferences. Only provided fields will be updated.
 *
 * @example
 * ```typescript
 * // Update only email preferences
 * const preferences: UpdatePreferencesDto = {
 *   emailEnabled: true,
 *   emailPriority: 2
 * };
 *
 * // Update all channels
 * const allPreferences: UpdatePreferencesDto = {
 *   emailEnabled: true,
 *   smsEnabled: false,
 *   whatsappEnabled: true,
 *   pushEnabled: true,
 *   emailPriority: 1,
 *   smsPriority: 2,
 *   whatsappPriority: 3,
 *   pushPriority: 4
 * };
 * ```
 */
export class UpdatePreferencesDto {
  /**
   * Enable or disable email notifications
   *
   * @type {boolean}
   * @description Controls whether the user will receive notifications via email.
   * When enabled, email becomes an available channel for delivering notifications
   * to this user.
   *
   * @example true
   * @default true
   * @optional
   */
  @ApiPropertyOptional({
    description: 'Enable or disable email notifications',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  /**
   * Enable or disable SMS notifications
   *
   * @type {boolean}
   * @description Controls whether the user will receive notifications via SMS.
   * Requires a valid phone number in the user's profile. When enabled, SMS
   * becomes an available channel for delivering notifications.
   *
   * @example false
   * @default false
   * @optional
   */
  @ApiPropertyOptional({
    description: 'Enable or disable SMS notifications',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  /**
   * Enable or disable WhatsApp notifications
   *
   * @type {boolean}
   * @description Controls whether the user will receive notifications via WhatsApp.
   * Requires a valid phone number and WhatsApp Business API access. When enabled,
   * WhatsApp becomes an available channel for delivering notifications.
   *
   * @example true
   * @default false
   * @optional
   */
  @ApiPropertyOptional({
    description: 'Enable or disable WhatsApp notifications',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  /**
   * Enable or disable push notifications
   *
   * @type {boolean}
   * @description Controls whether the user will receive push notifications on
   * their devices. Requires device token registration. When enabled, push
   * notifications become an available channel for delivering notifications.
   *
   * @example false
   * @default false
   * @optional
   */
  @ApiPropertyOptional({
    description: 'Enable or disable push notifications',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  /**
   * Priority level for email channel
   *
   * @type {number}
   * @description Sets the priority level for email notifications:
   * - 1 (LOW): Lowest priority
   * - 2 (MEDIUM): Standard priority
   * - 3 (HIGH): High priority
   * - 4 (URGENT): Highest priority
   *
   * This priority is used when no explicit priority is provided in the notification request.
   *
   * @example 1
   * @minimum 1
   * @maximum 4
   * @default 1
   * @optional
   */
  @ApiPropertyOptional({
    description: 'Priority level for email channel (1=Low, 2=Medium, 3=High, 4=Urgent)',
    example: 1,
    minimum: 1,
    maximum: 4,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  emailPriority?: number;

  /**
   * Priority level for SMS channel
   *
   * @type {number}
   * @description Sets the priority level for SMS notifications:
   * - 1 (LOW): Lowest priority
   * - 2 (MEDIUM): Standard priority
   * - 3 (HIGH): High priority
   * - 4 (URGENT): Highest priority
   *
   * This priority is used when no explicit priority is provided in the notification request.
   *
   * @example 2
   * @minimum 1
   * @maximum 4
   * @default 2
   * @optional
   */
  @ApiPropertyOptional({
    description: 'Priority level for SMS channel (1=Low, 2=Medium, 3=High, 4=Urgent)',
    example: 2,
    minimum: 1,
    maximum: 4,
    default: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  smsPriority?: number;

  /**
   * Priority level for WhatsApp channel
   *
   * @type {number}
   * @description Sets the priority level for WhatsApp notifications:
   * - 1 (LOW): Lowest priority
   * - 2 (MEDIUM): Standard priority
   * - 3 (HIGH): High priority
   * - 4 (URGENT): Highest priority
   *
   * This priority is used when no explicit priority is provided in the notification request.
   *
   * @example 3
   * @minimum 1
   * @maximum 4
   * @default 3
   * @optional
   */
  @ApiPropertyOptional({
    description: 'Priority level for WhatsApp channel (1=Low, 2=Medium, 3=High, 4=Urgent)',
    example: 3,
    minimum: 1,
    maximum: 4,
    default: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  whatsappPriority?: number;

  /**
   * Priority level for push notification channel
   *
   * @type {number}
   * @description Sets the priority level for push notifications:
   * - 1 (LOW): Lowest priority
   * - 2 (MEDIUM): Standard priority
   * - 3 (HIGH): High priority
   * - 4 (URGENT): Highest priority
   *
   * This priority is used when no explicit priority is provided in the notification request.
   *
   * @example 4
   * @minimum 1
   * @maximum 4
   * @default 4
   * @optional
   */
  @ApiPropertyOptional({
    description: 'Priority level for push notification channel (1=Low, 2=Medium, 3=High, 4=Urgent)',
    example: 4,
    minimum: 1,
    maximum: 4,
    default: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  pushPriority?: number;
}
