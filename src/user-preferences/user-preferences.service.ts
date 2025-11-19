import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePreferencesDto } from '../common/dto/update-preferences.dto';
import { NotificationChannel } from '../common/enums/notification.enums';

/**
 * User Preferences Service
 *
 * @class UserPreferencesService
 * @description Service for managing user notification preferences.
 * Handles retrieval, creation, and updates of user channel preferences
 * and priority settings.
 *
 * @example
 * ```typescript
 * // Get user preferences
 * const preferences = await preferencesService.getPreferences(userId);
 *
 * // Update preferences
 * await preferencesService.updatePreferences(userId, {
 *   emailEnabled: true,
 *   smsEnabled: false
 * });
 *
 * // Get preferred channels
 * const channels = await preferencesService.getPreferredChannels(userId);
 * ```
 */
@Injectable()
export class UserPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(userId: string) {
    const preferences = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      return await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const existing = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!existing) {
      return await this.prisma.notificationPreferences.create({
        data: {
          userId,
          ...dto,
        },
      });
    }

    return await this.prisma.notificationPreferences.update({
      where: { userId },
      data: dto,
    });
  }

  async getPreferredChannels(userId: string): Promise<NotificationChannel[]> {
    const preferences = await this.getPreferences(userId);
    const channels: NotificationChannel[] = [];

    if (preferences.emailEnabled) {
      channels.push(NotificationChannel.EMAIL);
    }
    if (preferences.smsEnabled) {
      channels.push(NotificationChannel.SMS);
    }
    if (preferences.whatsappEnabled) {
      channels.push(NotificationChannel.WHATSAPP);
    }
    if (preferences.pushEnabled) {
      channels.push(NotificationChannel.PUSH);
    }

    return channels;
  }

  async getChannelPriority(userId: string, channel: NotificationChannel): Promise<number> {
    const preferences = await this.getPreferences(userId);

    switch (channel) {
      case NotificationChannel.EMAIL:
        return preferences.emailPriority;
      case NotificationChannel.SMS:
        return preferences.smsPriority;
      case NotificationChannel.WHATSAPP:
        return preferences.whatsappPriority;
      case NotificationChannel.PUSH:
        return preferences.pushPriority;
      default:
        return 1;
    }
  }

  private async createDefaultPreferences(userId: string) {
    return await this.prisma.notificationPreferences.create({
      data: {
        userId,
        emailEnabled: true,
        smsEnabled: false,
        whatsappEnabled: false,
        pushEnabled: false,
        emailPriority: 1,
        smsPriority: 2,
        whatsappPriority: 3,
        pushPriority: 4,
      },
    });
  }
}
