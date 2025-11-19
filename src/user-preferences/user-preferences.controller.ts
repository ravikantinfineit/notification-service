import { Controller, Get, Put, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserPreferencesService } from './user-preferences.service';
import { UpdatePreferencesDto } from '../common/dto/update-preferences.dto';

/**
 * User Preferences Controller
 *
 * @class UserPreferencesController
 * @description Handles user notification preferences management endpoints.
 * Allows users to configure which notification channels are enabled and
 * set priority levels for each channel.
 *
 * @example
 * ```typescript
 * // Get user preferences
 * GET /users/{userId}/preferences
 *
 * // Update user preferences
 * PUT /users/{userId}/preferences
 * {
 *   "emailEnabled": true,
 *   "smsEnabled": false,
 *   "whatsappEnabled": true
 * }
 * ```
 */
@ApiTags('user-preferences')
@Controller('users/:userId/preferences')
export class UserPreferencesController {
  constructor(private readonly preferencesService: UserPreferencesService) {}

  /**
   * Get user notification preferences
   *
   * @method getPreferences
   * @description Retrieves the notification preferences for a specific user.
   * If preferences don't exist, default preferences are created and returned.
   *
   * @param {string} userId - Unique identifier of the user
   * @returns {Promise<NotificationPreferences>} User's notification preferences object
   *
   * @example
   * ```json
   * {
   *   "id": "pref-id",
   *   "userId": "user-id",
   *   "emailEnabled": true,
   *   "smsEnabled": false,
   *   "whatsappEnabled": true,
   *   "pushEnabled": false,
   *   "emailPriority": 1,
   *   "smsPriority": 2,
   *   "whatsappPriority": 3,
   *   "pushPriority": 4
   * }
   * ```
   */
  @Get()
  @ApiOperation({
    summary: 'Get user notification preferences',
    description:
      "Retrieves the notification preferences for a specific user. Creates default preferences if they don't exist.",
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier of the user',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User preferences retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        emailEnabled: { type: 'boolean' },
        smsEnabled: { type: 'boolean' },
        whatsappEnabled: { type: 'boolean' },
        pushEnabled: { type: 'boolean' },
        emailPriority: { type: 'number' },
        smsPriority: { type: 'number' },
        whatsappPriority: { type: 'number' },
        pushPriority: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPreferences(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.preferencesService.getPreferences(userId);
  }

  /**
   * Update user notification preferences
   *
   * @method updatePreferences
   * @description Updates the notification preferences for a specific user.
   * Only provided fields will be updated; other fields remain unchanged.
   * Creates preferences if they don't exist.
   *
   * @param {string} userId - Unique identifier of the user
   * @param {UpdatePreferencesDto} dto - Preferences data to update
   * @returns {Promise<NotificationPreferences>} Updated user preferences object
   *
   * @example
   * ```json
   * // Request body
   * {
   *   "emailEnabled": true,
   *   "smsEnabled": true,
   *   "whatsappEnabled": false,
   *   "emailPriority": 1,
   *   "smsPriority": 2
   * }
   * ```
   */
  @Put()
  @ApiOperation({
    summary: 'Update user notification preferences',
    description:
      'Updates the notification preferences for a specific user. Only provided fields will be updated.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier of the user',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdatePreferencesDto })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async updatePreferences(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return await this.preferencesService.updatePreferences(userId, dto);
  }
}
