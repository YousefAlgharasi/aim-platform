export const AUDIT_ENTITY_TYPES = [
  'course',
  'level',
  'chapter',
  'lesson',
  'skill',
  'objective',
  'lesson_asset',
  'question',
  'lesson_skill_mapping',
  'lesson_objective_mapping',
  'question_skill_mapping',
] as const;

export const AUDIT_EVENT_TYPES = [
  'created',
  'updated',
  'status_changed',
  'published',
  'archived',
  'restored',
  'skill_linked',
  'skill_unlinked',
  'objective_linked',
  'objective_unlinked',
  'asset_attached',
  'asset_removed',
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];
export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

export interface AuditLogInput {
  entityType: AuditEntityType;
  entityId: string;
  eventType: AuditEventType;
  actorUserId?: string | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AuditLogRow {
  id: string;
  actor_user_id: string | null;
  entity_type: AuditEntityType;
  entity_id: string;
  event_type: AuditEventType;
  previous_status: string | null;
  new_status: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actorUserId: string | null;
  entityType: AuditEntityType;
  entityId: string;
  eventType: AuditEventType;
  previousStatus: string | null;
  newStatus: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogListResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}
