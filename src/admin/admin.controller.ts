import { Controller, Get, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  NotificationStatus,
  NotificationChannel,
  ErrorType,
} from '../common/enums/notification.enums';

/**
 * Admin Controller
 *
 * @class AdminController
 * @description Handles admin dashboard and monitoring endpoints for the notification service.
 * Provides analytics, transaction tracking, error analysis, and channel performance metrics.
 *
 * @example
 * ```typescript
 * // Get dashboard statistics
 * GET /admin/dashboard
 *
 * // Search transactions
 * GET /admin/transactions?status=SENT&channel=EMAIL
 *
 * // Get error analytics
 * GET /admin/analytics/errors?startDate=2024-01-01
 * ```
 */
@ApiTags('admin')
@ApiSecurity('api-key')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get dashboard statistics
   *
   * @method getDashboard
   * @description Retrieves comprehensive dashboard statistics including notification counts,
   * queue statistics, success rates, and system health metrics.
   *
   * @param {string} [userId] - Optional user ID to filter statistics for a specific user
   * @returns {Promise<Object>} Dashboard statistics object with notification counts and queue stats
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description:
      'Retrieves comprehensive dashboard statistics including notification counts, queue statistics, and system health metrics.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Optional user ID to filter statistics',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboard(@Query('userId') userId?: string) {
    return await this.adminService.getDashboardStats(userId);
  }

  /**
   * Search and filter notification transactions
   *
   * @method searchTransactions
   * @description Searches notification transactions with various filters including status,
   * channel, user ID, transaction ID, date range, and failure reasons.
   *
   * @param {string} [transactionId] - Filter by specific transaction ID
   * @param {string} [userId] - Filter by user ID
   * @param {NotificationStatus} [status] - Filter by notification status
   * @param {NotificationChannel} [channel] - Filter by notification channel
   * @param {string} [failureReason] - Filter by failure reason (partial match)
   * @param {string} [startDate] - Start date for date range filter (ISO format)
   * @param {string} [endDate] - End date for date range filter (ISO format)
   * @param {number} [limit] - Maximum number of results to return
   * @param {number} [offset] - Number of results to skip (for pagination)
   * @returns {Promise<Object>} Object containing transactions array and pagination info
   */
  @Get('transactions')
  @ApiOperation({
    summary: 'Search notification transactions',
    description:
      'Searches and filters notification transactions with various criteria including status, channel, user, and date range.',
  })
  @ApiQuery({ name: 'transactionId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: NotificationStatus })
  @ApiQuery({ name: 'channel', required: false, enum: NotificationChannel })
  @ApiQuery({ name: 'failureReason', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async searchTransactions(
    @Query('transactionId') transactionId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: NotificationStatus,
    @Query('channel') channel?: NotificationChannel,
    @Query('failureReason') failureReason?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.adminService.searchTransactions({
      transactionId,
      userId,
      status,
      channel,
      failureReason,
      startDate,
      endDate,
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
    });
  }

  @Get('transactions/:transactionId')
  async getTransaction(@Param('transactionId') transactionId: string) {
    // This would be in TransactionTrackingService, but for admin access
    const { trackingService } = this.adminService as any;
    return await trackingService.getTransaction(transactionId);
  }

  @Get('failed')
  async getFailedTransactions(
    @Query('errorType') errorType?: ErrorType,
    @Query('retryable') retryable?: boolean,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.adminService.getFailedTransactions({
      errorType,
      retryable,
      startDate,
      endDate,
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
    });
  }

  @Get('analytics/errors')
  async getErrorAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.adminService.getErrorAnalytics(startDate, endDate);
  }

  @Get('analytics/channels')
  async getChannelPerformance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.adminService.getChannelPerformance(startDate, endDate);
  }
}
