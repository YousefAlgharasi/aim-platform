import { NotificationAuditActorType, NotificationAuditEntityType } from './notification-enums';

// `metadata` must remain safe and non-sensitive per
// docs/phase-13/notification-privacy-rules.md -- never notification body
// content, provider credentials, or child personal data beyond opaque ids.
export class NotificationAuditLogEntity {
  id!: string;
  actorId!: string | null;
  actorType!: NotificationAuditActorType;
  action!: string;
  entityType!: NotificationAuditEntityType;
  entityId!: string;
  metadata!: Record<string, unknown>;
  createdAt!: Date;
}
