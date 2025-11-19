import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TransactionTrackingModule } from '../transaction-tracking/transaction-tracking.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [TransactionTrackingModule, QueueModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
