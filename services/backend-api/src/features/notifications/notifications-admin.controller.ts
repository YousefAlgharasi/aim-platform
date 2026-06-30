import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { NotificationAuditService } from './notification-audit.service';
import { NotificationRepository } from './notification.repository';
import { AdminBroadcastService, CreateBroadcastPayload } from './admin-broadcast.service';
import {
  NotificationTemplateRow,
  NotificationPreferenceRow,
  NotificationEventRow,
  ReminderScheduleRow,
  DeliveryAttemptRow,
  NotificationAuditLogRow,
  AdminBroadcastScheduleRow,
} from './notification-repository.types';

function paginate<T>(rows: T[], total: number, page: number, limit: number) {
  return { data: rows, total, page, limit };
}

function mapTemplate(r: NotificationTemplateRow) {
  return {
    id: r.id,
    key: r.key,
    channel: r.channel,
    locale: r.locale,
    category: r.category,
    status: r.status,
    titleTemplate: r.title_template,
    bodyTemplate: r.body_template,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapPreference(r: NotificationPreferenceRow) {
  return {
    id: r.id,
    userId: r.user_id,
    userType: r.user_type,
    channel: r.channel,
    category: r.category,
    enabled: r.enabled,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapEvent(r: NotificationEventRow) {
  return {
    id: r.id,
    recipientId: r.recipient_id,
    recipientType: r.recipient_type,
    templateId: r.template_id,
    category: r.category,
    channel: r.channel,
    payload: r.payload,
    state: r.state,
    readAt: r.read_at,
    dismissedAt: r.dismissed_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapSchedule(r: ReminderScheduleRow) {
  return {
    id: r.id,
    ownerId: r.owner_id,
    ownerType: r.owner_type,
    kind: r.kind,
    cadence: r.cadence,
    nextRunAt: r.next_run_at,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapDeliveryAttempt(r: DeliveryAttemptRow) {
  return {
    id: r.id,
    notificationEventId: r.notification_event_id,
    channel: r.channel,
    provider: r.provider,
    attemptNumber: r.attempt_number,
    status: r.status,
    errorCode: r.error_code,
    createdAt: r.created_at,
  };
}

function mapBroadcast(r: AdminBroadcastScheduleRow) {
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    channel: r.channel,
    audience: r.audience,
    schedule: r.schedule,
    status: r.status,
    lastRunAt: r.last_run_at,
    nextRunAt: r.next_run_at,
    sentCount: r.sent_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapAuditLog(r: NotificationAuditLogRow) {
  return {
    id: r.id,
    actorId: r.actor_id,
    actorType: r.actor_type,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    metadata: r.metadata,
    createdAt: r.created_at,
  };
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
    private readonly broadcastService: AdminBroadcastService,
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
      return paginate(rows.map(mapAuditLog), rows.length, pg, lim);
    }
    if (action) {
      const rows = await this.auditService.getByEventType(action, lim, offset);
      return paginate(rows.map(mapAuditLog), rows.length, pg, lim);
    }
    const { rows, total } = await this.repo.findAllAuditLogsPage(lim, offset);
    return paginate(rows.map(mapAuditLog), total, pg, lim);
  }

  @Get('delivery-attempts/:eventId')
  @ApiOperation({ summary: 'View delivery attempts for a notification event (admin read-only)' })
  async getDeliveryAttempts(@Param('eventId') eventId: string) {
    const rows = await this.repo.findAttemptsByEventId(eventId);
    return rows.map(mapDeliveryAttempt);
  }

  @Get('events/:userId')
  @ApiOperation({ summary: 'View notification events for a user (admin read-only)' })
  async getUserEvents(
    @Param('userId') userId: string,
    @Query('channel') channel = 'in_app',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const rows = await this.repo.findEventsByUserId(
      userId,
      channel,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
    return rows.map(mapEvent);
  }

  @Get('queue')
  @ApiOperation({ summary: 'List queued/scheduled notification events (admin read-only)' })
  async getQueue(@Query('page') page = '1', @Query('limit') limit = '20') {
    const lim = parseInt(limit, 10) || 20;
    const pg = parseInt(page, 10) || 1;
    const { rows, total } = await this.repo.findQueuedEventsPage(lim, (pg - 1) * lim);
    return paginate(rows.map(mapEvent), total, pg, lim);
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
    return paginate(rows.map(mapSchedule), total, pg, lim);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'List user notification preferences (admin read-only)' })
  async getPreferences(@Query('page') page = '1', @Query('limit') limit = '20') {
    const lim = parseInt(limit, 10) || 20;
    const pg = parseInt(page, 10) || 1;
    const { rows, total } = await this.repo.findAllPreferences(lim, (pg - 1) * lim);
    return paginate(rows.map(mapPreference), total, pg, lim);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List notification templates (admin read-only)' })
  async getTemplates(@Query('page') page = '1', @Query('limit') limit = '50') {
    const lim = parseInt(limit, 10) || 50;
    const pg = parseInt(page, 10) || 1;
    const { rows, total } = await this.repo.findTemplatesPage(lim, (pg - 1) * lim);
    return paginate(rows.map(mapTemplate), total, pg, lim);
  }

  @Get('templates/:templateId')
  @ApiOperation({ summary: 'View a notification template (admin read-only)' })
  async getTemplate(@Param('templateId') templateId: string) {
    const row = await this.repo.findTemplateById(templateId);
    return row ? mapTemplate(row) : null;
  }

  // --- Broadcasts ---

  @Post('broadcasts')
  @ApiOperation({ summary: 'Create and send an admin broadcast notification' })
  async createBroadcast(@Body() body: CreateBroadcastPayload & { createdBy?: string }, @Req() req: { user?: { sub?: string } }) {
    const createdBy = (req.user?.sub as string | undefined) ?? null;
    const broadcast = await this.broadcastService.createAndSend({ ...body, createdBy });
    return mapBroadcast(broadcast);
  }

  @Get('broadcasts')
  @ApiOperation({ summary: 'List admin broadcast schedules' })
  async getBroadcasts(@Query('page') page = '1', @Query('limit') limit = '20') {
    const lim = parseInt(limit, 10) || 20;
    const pg = parseInt(page, 10) || 1;
    const { rows, total } = await this.broadcastService.list(pg, lim);
    return paginate(rows.map(mapBroadcast), total, pg, lim);
  }

  @Post('broadcasts/:id/run')
  @ApiOperation({ summary: 'Manually fire a broadcast now' })
  async runBroadcast(@Param('id') id: string) {
    return this.broadcastService.fireBroadcastById(id);
  }

  @Patch('broadcasts/:id/disable')
  @ApiOperation({ summary: 'Disable an admin broadcast schedule' })
  async disableBroadcast(@Param('id') id: string) {
    const row = await this.broadcastService.disable(id);
    return row ? mapBroadcast(row) : null;
  }

  @Patch('broadcasts/:id/enable')
  @ApiOperation({ summary: 'Enable an admin broadcast schedule' })
  async enableBroadcast(@Param('id') id: string) {
    const row = await this.broadcastService.enable(id);
    return row ? mapBroadcast(row) : null;
  }

  @Delete('broadcasts/:id')
  @ApiOperation({ summary: 'Delete an admin broadcast schedule' })
  async deleteBroadcast(@Param('id') id: string) {
    await this.broadcastService.delete(id);
    return { deleted: true };
  }
}
