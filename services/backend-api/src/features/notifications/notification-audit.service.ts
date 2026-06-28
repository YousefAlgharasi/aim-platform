import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationAuditLogRow } from './notification-repository.types';
import { containsSensitiveData } from './notification-validation.helpers';

@Injectable()
export class NotificationAuditService {
  constructor(private readonly repo: NotificationRepository) {}

  async log(
    actorId: string | null,
    actorType: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown> | null,
  ): Promise<NotificationAuditLogRow> {
    const safeMetadata = metadata && !containsSensitiveData(metadata) ? metadata : null;
    return this.repo.createAuditLog(actorId, actorType, action, entityType, entityId, safeMetadata);
  }

  async getByUser(actorId: string, limit = 50, offset = 0): Promise<NotificationAuditLogRow[]> {
    return this.repo.findAuditLogsByUserId(actorId, limit, offset);
  }

  async getByEventType(
    action: string,
    limit = 50,
    offset = 0,
  ): Promise<NotificationAuditLogRow[]> {
    return this.repo.findAuditLogsByEventType(action, limit, offset);
  }
}
