import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationEventRow } from './notification-repository.types';
import { AnalyticsEventIngestionService } from '../analytics/analytics-event-ingestion.service';

@Injectable()
export class InAppNotificationService {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly analyticsEventIngestionService: AnalyticsEventIngestionService,
  ) {}

  async getInbox(userId: string, limit = 20, offset = 0): Promise<NotificationEventRow[]> {
    return this.repo.findInAppEventsByUserId(userId, limit, offset);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.countUnreadByUserId(userId);
  }

  async markAsRead(eventId: string, userId: string): Promise<NotificationEventRow> {
    const updated = await this.repo.updateEventStatus(eventId, userId, 'read');
    if (!updated) throw new NotFoundException('Notification not found');

    await this.analyticsEventIngestionService.ingest({
      eventType: 'notification.read',
      actorRole: 'student',
      actorId: userId,
      subjectType: 'notification',
      subjectId: eventId,
      metadata: { category: updated.category, channel: 'in_app' },
    });

    return updated;
  }

  async dismiss(eventId: string, userId: string): Promise<NotificationEventRow> {
    const updated = await this.repo.updateEventStatus(eventId, userId, 'dismissed');
    if (!updated) throw new NotFoundException('Notification not found');
    return updated;
  }

  async createInAppEvent(
    userId: string,
    templateId: string,
    category: string,
    title: string,
    body: string,
  ): Promise<NotificationEventRow> {
    const event = await this.repo.createEvent(userId, templateId, 'in_app', category, 'sent', title, body, null);

    await this.analyticsEventIngestionService.ingest({
      eventType: 'notification.delivered',
      actorRole: 'system',
      actorId: userId,
      subjectType: 'notification',
      subjectId: event.id,
      metadata: { category, channel: 'in_app' },
    });

    return event;
  }
}
