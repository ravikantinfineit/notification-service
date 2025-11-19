import { Injectable, Logger } from '@nestjs/common';
import { EmailProviderService } from './providers/email-provider.service';
import { SmsProviderService } from './providers/sms-provider.service';
import { WhatsAppProviderService } from './providers/whatsapp-provider.service';
import { PushProviderService } from './providers/push-provider.service';
import { NotificationChannel } from '../common/enums/notification.enums';

/**
 * Notification Service
 *
 * @class NotificationService
 * @description Core service for sending notifications through various channels.
 * Acts as a facade that delegates to specific provider services (Email, SMS, WhatsApp, Push).
 * Handles routing notifications to the appropriate provider based on channel type.
 *
 * @example
 * ```typescript
 * // Send email notification
 * await notificationService.sendEmail(
 *   'user@example.com',
 *   'Welcome!',
 *   'Welcome to our service'
 * );
 *
 * // Send SMS notification
 * await notificationService.sendSMS('+1234567890', 'Your code is 1234');
 * ```
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly emailProvider: EmailProviderService,
    private readonly smsProvider: SmsProviderService,
    private readonly whatsappProvider: WhatsAppProviderService,
    private readonly pushProvider: PushProviderService,
  ) {}

  /**
   * Send an email notification
   *
   * @method sendEmail
   * @description Sends an email notification using the SendGrid provider service.
   *
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject line
   * @param {string} content - Email body content
   * @param {Record<string, any>} [metadata] - Optional metadata (HTML content, attachments, etc.)
   * @returns {Promise<any>} Provider response object with success status and message ID
   * @throws {Error} If email sending fails
   */
  async sendEmail(
    to: string,
    subject: string,
    content: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    this.logger.log(`Sending email to ${to}`);
    return await this.emailProvider.send(to, subject, content, metadata);
  }

  /**
   * Send an SMS notification
   *
   * @method sendSMS
   * @description Sends an SMS notification using the Twilio provider service.
   *
   * @param {string} to - Recipient phone number (E.164 format: +1234567890)
   * @param {string} content - SMS message content
   * @param {Record<string, any>} [metadata] - Optional metadata for SMS
   * @returns {Promise<any>} Provider response object with success status and message SID
   * @throws {Error} If SMS sending fails
   */
  async sendSMS(to: string, content: string, metadata?: Record<string, any>): Promise<any> {
    this.logger.log(`Sending SMS to ${to}`);
    return await this.smsProvider.send(to, content, metadata);
  }

  /**
   * Send a WhatsApp notification
   *
   * @method sendWhatsApp
   * @description Sends a WhatsApp message using the Twilio WhatsApp API.
   *
   * @param {string} to - Recipient phone number (E.164 format or whatsapp:+1234567890)
   * @param {string} content - WhatsApp message content
   * @param {Record<string, any>} [metadata] - Optional metadata for WhatsApp message
   * @returns {Promise<any>} Provider response object with success status and message SID
   * @throws {Error} If WhatsApp sending fails
   */
  async sendWhatsApp(to: string, content: string, metadata?: Record<string, any>): Promise<any> {
    this.logger.log(`Sending WhatsApp message to ${to}`);
    return await this.whatsappProvider.send(to, content, metadata);
  }

  /**
   * Send a push notification
   *
   * @method sendPushNotification
   * @description Sends a push notification to a device (placeholder implementation).
   * In production, this would integrate with FCM, APNs, or similar services.
   *
   * @param {string} to - Device token or user ID
   * @param {string} content - Push notification body content
   * @param {string} [title] - Optional push notification title
   * @param {Record<string, any>} [metadata] - Optional metadata for push notification
   * @returns {Promise<any>} Provider response object with success status
   * @throws {Error} If push notification sending fails
   */
  async sendPushNotification(
    to: string,
    content: string,
    title?: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    this.logger.log(`Sending push notification to ${to}`);
    return await this.pushProvider.send(to, content, title, metadata);
  }

  /**
   * Send a notification through the specified channel
   *
   * @method sendNotification
   * @description Generic method that routes notifications to the appropriate provider
   * based on the specified channel. Acts as a unified interface for all notification types.
   *
   * @param {NotificationChannel} channel - Channel type (EMAIL, SMS, WHATSAPP, PUSH)
   * @param {string} recipient - Recipient address (email, phone, device token, etc.)
   * @param {string} content - Notification content/body
   * @param {string} [subject] - Optional subject/title for the notification
   * @param {Record<string, any>} [metadata] - Optional metadata
   * @returns {Promise<any>} Provider response object
   * @throws {Error} If channel is unsupported or sending fails
   */
  async sendNotification(
    channel: NotificationChannel,
    recipient: string,
    content: string,
    subject?: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return await this.sendEmail(recipient, subject || 'Notification', content, metadata);
      case NotificationChannel.SMS:
        return await this.sendSMS(recipient, content, metadata);
      case NotificationChannel.WHATSAPP:
        return await this.sendWhatsApp(recipient, content, metadata);
      case NotificationChannel.PUSH:
        return await this.sendPushNotification(recipient, content, subject, metadata);
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }
}
