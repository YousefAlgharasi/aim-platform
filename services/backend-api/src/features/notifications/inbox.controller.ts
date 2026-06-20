import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { InAppNotificationService } from './in-app-notification.service';
import { NotificationAuditService } from './notification-audit.service';
import { NotificationOwnershipGuard } from './guards';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/v1/notifications')
export class InboxController {
  constructor(
    private readonly inAppService: InAppNotificationService,
    private readonly auditService: NotificationAuditService,
  ) {}

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
}
