import { IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for updating user notification preferences
 *
 * @class UpdatePreferencesDto
 * @description Allows users to configure which notification channels are enabled
 * and set priority levels for each channel
 */
export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    description: 'Enable or disable email notifications',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Enable or disable SMS notifications',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Enable or disable WhatsApp notifications',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Enable or disable push notifications',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

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
