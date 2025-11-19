import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailProviderService {
  private readonly logger = new Logger(EmailProviderService.name);

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      this.logger.warn('SENDGRID_API_KEY not set. Email sending will fail.');
    } else {
      sgMail.setApiKey(apiKey);
    }
  }

  async send(
    to: string,
    subject: string,
    content: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    try {
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';

      const msg = {
        to,
        from: fromEmail,
        subject,
        text: content,
        html: metadata?.html || content.replace(/\n/g, '<br>'),
        ...metadata,
      };

      const response = await sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${to}`);
      return {
        success: true,
        messageId: response[0]?.headers['x-message-id'],
        provider: 'sendgrid',
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw {
        ...error,
        provider: 'sendgrid',
        recipient: to,
      };
    }
  }
}
