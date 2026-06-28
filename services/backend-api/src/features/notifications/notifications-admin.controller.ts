import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { NotificationAuditService } from './notification-audit.service';
import { NotificationRepository } from './notification.repository';

function paginate<T>(rows: T[], total: number, page: number, limit: number) {
  return { data: rows, total, page, limit };
}

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/notifications')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class NotificationsAdminController {
  constructor(
    private readonly auditService: NotificationAuditService,
    private readonly repo: NotificationRepository,
  ) {}

  @Get('audit-logs')
  @ApiOperation({ summary: 'List notification audit logs (admin read-only)' })
  async getAuditLogs(
    @Query('actorId') actorId?: string,
    @Query('action') action?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const lim = parseInt(limit, 10) || 50;
    const pg = parseInt(page, 10) || 1;
    const offset = (pg - 1) * lim;

    if (actorId) {
      const rows = await this.auditService.getByUser(actorId, lim, offset);
      return paginate(rows, rows.length, pg, lim);
    }
    if (action) {
      const rows = await this.auditService.getByEventType(action, lim, offset);
      return paginate(rows, rows.length, pg, lim);
    }
    const { rows, total } = await this.repo.findAllAuditLogsPage(lim, offset);
    return paginate(rows, total, pg, lim);
  }

  @Get('delivery-attempts/:eventId')
  @ApiOperation({ summary: 'View delivery attempts for a notification event (admin read-only)' })
  async getDeliveryAttempts(@Param('eventId') eventId: string) {
    return this.repo.findAttemptsByEventId(eventId);
  }

  @Get('events/:userId')
  @ApiOperation({ summary: 'View notification events for a user (admin read-only)' })
  async getUserEvents(
    @Param('userId') userId: string,
    @Query('channel') channel = 'in_app',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.repo.findEventsByUserId(
      userId,
      channel,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('queue')
  @ApiOperation({ summary: 'List queued/scheduled notification events (admin read-only)' })
  async getQueue(@Query('page') page = '1', @Query('limit') limit = '20') {
    const lim = parseInt(limit, 10) || 20;
    const pg = parseInt(page, 10) || 1;
    const { rows, total } = await this.repo.findQueuedEventsPage(lim, (pg - 1) * lim);
    return paginate(rows, total, pg, lim);
  }

  @Get('schedules')
  @ApiOperation({ summary: 'List reminder schedules (admin read-only)' })
  async getSchedules(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const lim = parseInt(limit, 10) || 20;
    const pg = parseInt(page, 10) || 1;
    const { rows, total } = await this.repo.findSchedulesPage(lim, (pg - 1) * lim, status);
    return paginate(rows, total, pg, lim);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'List user notification preferences (admin read-only)' })
  async getPreferences(@Query('page') page = '1', @Query('limit') limit = '20') {
    const lim = parseInt(limit, 10) || 20;
    const pg = parseInt(page, 10) || 1;
    const { rows, total } = await this.repo.findAllPreferences(lim, (pg - 1) * lim);
    return paginate(rows, total, pg, lim);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List notification templates (admin read-only)' })
  async getTemplates(@Query('page') page = '1', @Query('limit') limit = '50') {
    const lim = parseInt(limit, 10) || 50;
    const pg = parseInt(page, 10) || 1;
    const { rows, total } = await this.repo.findTemplatesPage(lim, (pg - 1) * lim);
    return paginate(rows, total, pg, lim);
  }

  @Get('templates/:templateId')
  @ApiOperation({ summary: 'View a notification template (admin read-only)' })
  async getTemplate(@Param('templateId') templateId: string) {
    return this.repo.findTemplateById(templateId);
  }
}
