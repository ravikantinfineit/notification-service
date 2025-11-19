import { Injectable, Logger } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class WhatsAppProviderService {
  private readonly logger = new Logger(WhatsAppProviderService.name);
  private readonly client: twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (
      !accountSid ||
      !authToken ||
      accountSid === 'your_twilio_account_sid' ||
      authToken === 'your_twilio_auth_token'
    ) {
      this.logger.warn('Twilio credentials not set. WhatsApp sending will fail.');
      this.client = null;
    } else {
      try {
        this.client = twilio(accountSid, authToken);
      } catch (error) {
        this.logger.warn(`Failed to initialize Twilio client: ${error.message}`);
        this.client = null;
      }
    }
  }

  async send(to: string, content: string, metadata?: Record<string, any>): Promise<any> {
    try {
      if (!this.client) {
        throw new Error('Twilio client not initialized');
      }

      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

      // Ensure 'to' is in WhatsApp format
      const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      const message = await this.client.messages.create({
        body: content,
        from: fromNumber,
        to: whatsappTo,
        ...metadata,
      });

      this.logger.log(`WhatsApp message sent successfully to ${whatsappTo}`);
      return {
        success: true,
        messageId: message.sid,
        status: message.status,
        provider: 'twilio-whatsapp',
      };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message to ${to}: ${error.message}`);
      throw {
        ...error,
        provider: 'twilio-whatsapp',
        recipient: to,
      };
    }
  }
}
