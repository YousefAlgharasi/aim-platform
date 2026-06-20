import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { DeviceTokenService } from './device-token.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { InAppNotificationService } from './in-app-notification.service';
import { ReminderScheduleService } from './reminder-schedule.service';
import { NotificationAuditService } from './notification-audit.service';
import {
  RegisterDeviceTokenRequestDto,
  UpdateNotificationPreferenceRequestDto,
  UpdateQuietHoursRequestDto,
  DeviceTokenEntity,
  NotificationPreferenceEntity,
  NotificationEventEntity,
  ReminderScheduleEntity,
} from './dto';
import { NotificationRepository } from './notification.repository';
import { NotificationOwnershipGuard } from './guards';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(
    private readonly deviceTokenService: DeviceTokenService,
    private readonly preferenceService: NotificationPreferenceService,
    private readonly inAppService: InAppNotificationService,
    private readonly scheduleService: ReminderScheduleService,
    private readonly auditService: NotificationAuditService,
    private readonly repo: NotificationRepository,
  ) {}

  // --- P13-042: Device Token ---

  @Post('device-tokens')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Register or update a push device token' })
  async registerDeviceToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterDeviceTokenRequestDto,
  ) {
    const token = await this.deviceTokenService.registerToken(
      user.id,
      dto.platform,
      dto.token,
      dto.deviceName ?? null,
    );
    await this.auditService.log(user.id, 'token_registered', token.id, 'device_token', {
      platform: dto.platform,
    });
    return token;
  }

  @Delete('device-tokens/:tokenId')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Disable a device token' })
  async disableDeviceToken(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tokenId') tokenId: string,
  ) {
    await this.deviceTokenService.disableToken(tokenId, user.id);
    await this.auditService.log(user.id, 'token_disabled', tokenId, 'device_token', null);
    return { success: true };
  }

  // --- P13-043: Preferences ---

  @Get('preferences')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Get notification preferences' })
  async getPreferences(@CurrentUser() user: AuthenticatedUser) {
    return this.preferenceService.getPreferences(user.id);
  }

  @Patch('preferences')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Update a notification preference' })
  async updatePreference(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateNotificationPreferenceRequestDto,
  ) {
    const userType = user.role === 'parent' ? 'parent' : 'student';
    const pref = await this.preferenceService.updatePreference(
      user.id,
      userType,
      dto.channel,
      dto.category,
      dto.enabled,
    );
    await this.auditService.log(user.id, 'preference_updated', pref.id, 'notification_preference', {
      channel: dto.channel,
      category: dto.category,
      enabled: dto.enabled,
    });
    return pref;
  }

  // --- P13-044: In-App Notifications ---

  @Get('inbox')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Get in-app notification inbox' })
  async getInbox(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.inAppService.getInbox(
      user.id,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('inbox/unread-count')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    const count = await this.inAppService.getUnreadCount(user.id);
    return { count };
  }

  @Patch('inbox/:eventId/read')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
  ) {
    const updated = await this.inAppService.markAsRead(eventId, user.id);
    await this.auditService.log(user.id, 'notification_read', eventId, 'notification_event', null);
    return updated;
  }

  @Patch('inbox/:eventId/dismiss')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Dismiss a notification' })
  async dismissNotification(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
  ) {
    const updated = await this.inAppService.dismiss(eventId, user.id);
    await this.auditService.log(user.id, 'notification_dismissed', eventId, 'notification_event', null);
    return updated;
  }

  // --- P13-045: Reminder Schedules ---

  @Get('reminders')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Get active reminder schedules' })
  async getReminders(@CurrentUser() user: AuthenticatedUser) {
    return this.scheduleService.getActiveSchedules(user.id);
  }

  @Patch('reminders/:scheduleId/pause')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Pause a reminder schedule' })
  async pauseReminder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('scheduleId') scheduleId: string,
  ) {
    const updated = await this.scheduleService.pauseSchedule(scheduleId, user.id);
    await this.auditService.log(user.id, 'schedule_paused', scheduleId, 'reminder_schedule', null);
    return updated;
  }

  @Patch('reminders/:scheduleId/resume')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Resume a paused reminder schedule' })
  async resumeReminder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('scheduleId') scheduleId: string,
  ) {
    const updated = await this.scheduleService.resumeSchedule(scheduleId, user.id);
    return updated;
  }

  @Patch('reminders/:scheduleId/cancel')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Cancel a reminder schedule' })
  async cancelReminder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('scheduleId') scheduleId: string,
  ) {
    const updated = await this.scheduleService.cancelSchedule(scheduleId, user.id);
    await this.auditService.log(user.id, 'schedule_cancelled', scheduleId, 'reminder_schedule', null);
    return updated;
  }

  // --- P13-043 extension: Quiet Hours ---

  @Get('quiet-hours')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Get quiet hours settings' })
  async getQuietHours(@CurrentUser() user: AuthenticatedUser) {
    return this.repo.findQuietHoursByUserId(user.id);
  }

  @Patch('quiet-hours')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Update quiet hours settings' })
  async updateQuietHours(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateQuietHoursRequestDto,
  ) {
    const quietHours = await this.repo.upsertQuietHours(
      user.id,
      dto.enabled,
      dto.startTime,
      dto.endTime,
      dto.timezone,
    );
    await this.auditService.log(user.id, 'quiet_hours_updated', quietHours.id, 'quiet_hours', {
      enabled: dto.enabled,
    });
    return quietHours;
  }
}
