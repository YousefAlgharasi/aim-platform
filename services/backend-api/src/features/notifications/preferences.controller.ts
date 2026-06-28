import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { resolveAuthorizedRoles } from '../../auth/authorization/authorized-role.resolver';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationAuditService } from './notification-audit.service';
import { NotificationRepository } from './notification.repository';
import { UpdateNotificationPreferenceRequestDto, UpdateQuietHoursRequestDto } from './dto';
import { NotificationOwnershipGuard } from './guards';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/v1/notifications')
export class PreferencesController {
  constructor(
    private readonly preferenceService: NotificationPreferenceService,
    private readonly auditService: NotificationAuditService,
    private readonly repo: NotificationRepository,
  ) {}

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
    const resolvedRoles = resolveAuthorizedRoles(user);
    const userType = resolvedRoles.includes(AuthorizedRole.PARENT) ? 'parent' : 'student';
    const pref = await this.preferenceService.updatePreference(
      user.id,
      userType,
      dto.channel,
      dto.category,
      dto.enabled,
    );
    await this.auditService.log(user.id, userType, 'preference_updated', 'notification_preference', pref.id, {
      channel: dto.channel,
      category: dto.category,
      enabled: dto.enabled,
    });
    return pref;
  }

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
    const resolvedRoles = resolveAuthorizedRoles(user);
    const userType = resolvedRoles.includes(AuthorizedRole.PARENT) ? 'parent' : 'student';
    const quietHours = await this.repo.upsertQuietHours(
      user.id,
      userType,
      dto.enabled,
      dto.startTime,
      dto.endTime,
      dto.timezone,
    );
    await this.auditService.log(
      user.id,
      userType,
      'quiet_hours_updated',
      'notification_quiet_hours',
      quietHours?.id ?? user.id,
      { enabled: dto.enabled },
    );
    return quietHours;
  }
}
