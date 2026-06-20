import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationEventRow } from './notification-repository.types';

@Injectable()
export class InAppNotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  async getInbox(userId: string, limit = 20, offset = 0): Promise<NotificationEventRow[]> {
    return this.repo.findInAppEventsByUserId(userId, limit, offset);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.countUnreadByUserId(userId);
  }

  async markAsRead(eventId: string, userId: string): Promise<NotificationEventRow> {
    const updated = await this.repo.updateEventStatus(eventId, userId, 'read');
    if (!updated) throw new NotFoundException('Notification not found');
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
    return this.repo.createEvent(userId, templateId, 'in_app', category, 'sent', title, body, null);
  }
}
