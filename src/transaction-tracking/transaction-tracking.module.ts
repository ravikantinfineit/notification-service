import { Module } from '@nestjs/common';
import { TransactionTrackingService } from './transaction-tracking.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TransactionTrackingService],
  exports: [TransactionTrackingService],
})
export class TransactionTrackingModule {}
