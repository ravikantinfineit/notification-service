import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationModule } from './notification/notification.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { TransactionTrackingModule } from './transaction-tracking/transaction-tracking.module';
import { AdminModule } from './admin/admin.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    PrismaModule,
    QueueModule,
    NotificationModule,
    UserPreferencesModule,
    TransactionTrackingModule,
    AdminModule,
  ],
})
export class AppModule {}
