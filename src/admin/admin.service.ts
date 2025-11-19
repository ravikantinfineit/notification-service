import { Injectable } from '@nestjs/common';
import { TransactionTrackingService } from '../transaction-tracking/transaction-tracking.service';
import { QueueService } from '../queue/queue.service';
import {
  NotificationStatus,
  NotificationChannel,
  ErrorType,
} from '../common/enums/notification.enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    public readonly trackingService: TransactionTrackingService,
    private readonly queueService: QueueService,
    private readonly prisma: PrismaService,
  ) {}

  async getDashboardStats(userId?: string) {
    const [statistics, queueStats] = await Promise.all([
      this.trackingService.getStatistics(userId),
      this.queueService.getQueueStats(),
    ]);

    return {
      statistics,
      queueStats,
      timestamp: new Date().toISOString(),
    };
  }

  async searchTransactions(filters: {
    transactionId?: string;
    userId?: string;
    status?: NotificationStatus;
    channel?: NotificationChannel;
    failureReason?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.transactionId) {
      where.transactionId = filters.transactionId;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.channel) {
      where.channel = filters.channel;
    }
    if (filters.failureReason) {
      where.failureReason = {
        contains: filters.failureReason,
        mode: 'insensitive',
      };
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const [transactions, total] = await Promise.all([
      this.prisma.notificationTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          errorLogs: {
            orderBy: { createdAt: 'desc' },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.notificationTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  async getFailedTransactions(filters: {
    errorType?: ErrorType;
    retryable?: boolean;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      status: {
        in: [NotificationStatus.FAILED, NotificationStatus.DEAD_LETTER],
      },
    };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const transactions = await this.prisma.notificationTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        errorLogs: {
          where: filters.errorType
            ? { errorType: filters.errorType }
            : filters.retryable !== undefined
              ? { retryable: filters.retryable }
              : {},
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const total = await this.prisma.notificationTransaction.count({ where });

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  async getErrorAnalytics(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const errorLogs = await this.prisma.errorLog.findMany({
      where,
      include: {
        transaction: {
          select: {
            transactionId: true,
            channel: true,
            notificationType: true,
            userId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const errorTypeCounts = await this.prisma.errorLog.groupBy({
      by: ['errorType'],
      where,
      _count: {
        id: true,
      },
    });

    const retryableCounts = await this.prisma.errorLog.groupBy({
      by: ['retryable'],
      where,
      _count: {
        id: true,
      },
    });

    return {
      totalErrors: errorLogs.length,
      errorTypeBreakdown: errorTypeCounts.map((item) => ({
        errorType: item.errorType,
        count: item._count.id,
      })),
      retryableBreakdown: retryableCounts.map((item) => ({
        retryable: item.retryable,
        count: item._count.id,
      })),
      recentErrors: errorLogs.slice(0, 50),
    };
  }

  async getChannelPerformance(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const channelStats = await this.prisma.notificationTransaction.groupBy({
      by: ['channel', 'status'],
      where,
      _count: {
        id: true,
      },
    });

    const channelPerformance = {};

    channelStats.forEach((stat) => {
      if (!channelPerformance[stat.channel]) {
        channelPerformance[stat.channel] = {
          total: 0,
          sent: 0,
          failed: 0,
          pending: 0,
          retry: 0,
          deadLetter: 0,
        };
      }

      channelPerformance[stat.channel].total += stat._count.id;

      switch (stat.status) {
        case NotificationStatus.SENT:
          channelPerformance[stat.channel].sent += stat._count.id;
          break;
        case NotificationStatus.FAILED:
        case NotificationStatus.DEAD_LETTER:
          channelPerformance[stat.channel].failed += stat._count.id;
          break;
        case NotificationStatus.PENDING:
        case NotificationStatus.QUEUED:
        case NotificationStatus.PROCESSING:
          channelPerformance[stat.channel].pending += stat._count.id;
          break;
        case NotificationStatus.RETRY:
          channelPerformance[stat.channel].retry += stat._count.id;
          break;
      }
    });

    // Calculate success rates
    Object.keys(channelPerformance).forEach((channel) => {
      const stats = channelPerformance[channel];
      stats.successRate = stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(2) : '0.00';
      stats.failureRate =
        stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(2) : '0.00';
    });

    return channelPerformance;
  }
}
