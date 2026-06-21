import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationAuditLogRow } from './notification-repository.types';
import { containsSensitiveData } from './notification-validation.helpers';

@Injectable()
export class NotificationAuditService {
  constructor(private readonly repo: NotificationRepository) {}

  async log(
    userId: string,
    eventType: string,
    resourceId: string | null,
    resourceType: string | null,
    metadata: Record<string, unknown> | null,
  ): Promise<NotificationAuditLogRow> {
    const safeMetadata = metadata && !containsSensitiveData(metadata) ? metadata : null;
    return this.repo.createAuditLog(userId, eventType, resourceId, resourceType, safeMetadata);
  }

  async getByUser(userId: string, limit = 50, offset = 0): Promise<NotificationAuditLogRow[]> {
    return this.repo.findAuditLogsByUserId(userId, limit, offset);
  }

  async getByEventType(
    eventType: string,
    limit = 50,
    offset = 0,
  ): Promise<NotificationAuditLogRow[]> {
    return this.repo.findAuditLogsByEventType(eventType, limit, offset);
  }
}
