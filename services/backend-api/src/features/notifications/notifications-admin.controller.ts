import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { NotificationAdminGuard } from './guards';
import { NotificationAuditService } from './notification-audit.service';
import { NotificationRepository } from './notification.repository';

@ApiTags('Admin Notifications')
@ApiBearerAuth()
@Controller('api/v1/admin/notifications')
@UseGuards(SupabaseJwtAuthGuard, NotificationAdminGuard)
export class NotificationsAdminController {
  constructor(
    private readonly auditService: NotificationAuditService,
    private readonly repo: NotificationRepository,
  ) {}

  @Get('audit-logs')
  @ApiOperation({ summary: 'List notification audit logs (admin read-only)' })
  async getAuditLogs(
    @Query('eventType') eventType?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 50;
    const off = offset ? parseInt(offset, 10) : 0;

    if (userId) {
      return this.auditService.getByUser(userId, lim, off);
    }
    if (eventType) {
      return this.auditService.getByEventType(eventType, lim, off);
    }
    return this.auditService.getByEventType('notification_sent', lim, off);
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
}
