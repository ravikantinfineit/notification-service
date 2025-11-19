import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EmailProviderService } from './providers/email-provider.service';
import { SmsProviderService } from './providers/sms-provider.service';
import { WhatsAppProviderService } from './providers/whatsapp-provider.service';
import { PushProviderService } from './providers/push-provider.service';
import { QueueModule } from '../queue/queue.module';
import { TransactionTrackingModule } from '../transaction-tracking/transaction-tracking.module';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => QueueModule),
    TransactionTrackingModule,
    UserPreferencesModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailProviderService,
    SmsProviderService,
    WhatsAppProviderService,
    PushProviderService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
