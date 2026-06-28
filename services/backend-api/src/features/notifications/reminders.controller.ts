import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { resolveAuthorizedRoles } from '../../auth/authorization/authorized-role.resolver';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { ReminderScheduleService } from './reminder-schedule.service';
import { NotificationAuditService } from './notification-audit.service';
import { NotificationOwnershipGuard } from './guards';

function resolveUserType(user: AuthenticatedUser): string {
  return resolveAuthorizedRoles(user).includes(AuthorizedRole.PARENT) ? 'parent' : 'student';
}

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/v1/notifications')
export class RemindersController {
  constructor(
    private readonly scheduleService: ReminderScheduleService,
    private readonly auditService: NotificationAuditService,
  ) {}

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
    await this.auditService.log(user.id, resolveUserType(user), 'schedule_paused', 'reminder_schedule', scheduleId, null);
    return updated;
  }

  @Patch('reminders/:scheduleId/resume')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Resume a paused reminder schedule' })
  async resumeReminder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.scheduleService.resumeSchedule(scheduleId, user.id);
  }

  @Patch('reminders/:scheduleId/cancel')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Cancel a reminder schedule' })
  async cancelReminder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('scheduleId') scheduleId: string,
  ) {
    const updated = await this.scheduleService.cancelSchedule(scheduleId, user.id);
    await this.auditService.log(user.id, resolveUserType(user), 'schedule_cancelled', 'reminder_schedule', scheduleId, null);
    return updated;
  }
}
