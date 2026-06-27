import { adminApiClient } from './admin-api-client';

export type NotificationAuditLog = {
  readonly id: string;
  readonly eventType: string;
  readonly userId: string | null;
  readonly channel: string;
  readonly status: string;
  readonly createdAt: string;
};

export type NotificationTemplate = {
  readonly id: string;
  readonly name: string;
  readonly channel: string;
  readonly subject: string | null;
  readonly body: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function decodeAuditLog(v: unknown): NotificationAuditLog {
  const o = v as Record<string, unknown>;
  return {
    id: String(o.id ?? ''),
    eventType: String(o.eventType ?? o.event_type ?? ''),
    userId: typeof o.userId === 'string' ? o.userId : (typeof o.user_id === 'string' ? o.user_id : null),
    channel: String(o.channel ?? ''),
    status: String(o.status ?? ''),
    createdAt: String(o.createdAt ?? o.created_at ?? ''),
  };
}

function decodeAuditLogList(v: unknown): NotificationAuditLog[] {
  if (Array.isArray(v)) return v.map(decodeAuditLog);
  return [];
}

function decodeTemplate(v: unknown): NotificationTemplate {
  const o = v as Record<string, unknown>;
  return {
    id: String(o.id ?? ''),
    name: String(o.name ?? ''),
    channel: String(o.channel ?? ''),
    subject: typeof o.subject === 'string' ? o.subject : null,
    body: String(o.body ?? ''),
    createdAt: String(o.createdAt ?? o.created_at ?? ''),
    updatedAt: String(o.updatedAt ?? o.updated_at ?? ''),
  };
}

function decodeTemplateList(v: unknown): NotificationTemplate[] {
  if (Array.isArray(v)) return v.map(decodeTemplate);
  return [];
}

export async function fetchNotificationAuditLogs(
  token: string,
  limit = 50,
  offset = 0,
  eventType?: string,
): Promise<NotificationAuditLog[]> {
  const query: Record<string, string | number> = { limit, offset };
  if (eventType) query.eventType = eventType;
  const envelope = await adminApiClient.get('/api/v1/admin/notifications/audit-logs', decodeAuditLogList, {
    headers: { authorization: `Bearer ${token}` },
    query,
  });
  return envelope.data;
}

export async function fetchNotificationTemplates(
  token: string,
): Promise<NotificationTemplate[]> {
  const envelope = await adminApiClient.get('/api/v1/admin/notifications/templates', decodeTemplateList, {
    headers: { authorization: `Bearer ${token}` },
  });
  return envelope.data;
}
