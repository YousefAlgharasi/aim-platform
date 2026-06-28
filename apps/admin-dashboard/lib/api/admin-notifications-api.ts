// Admin notifications API client (read-only)
import { adminApiClient } from './admin-api-client';
import { decodePaginatedResponse, type AdminPaginatedResponse } from './admin-paginated-response';

/* ---- Templates ---- */

export type AdminNotificationTemplateItem = {
  readonly id: string;
  readonly key: string;
  readonly channel: string;
  readonly locale: string;
  readonly category: string;
  readonly status: string;
  readonly titleTemplate: string;
  readonly bodyTemplate: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function decodeTemplate(v: unknown): AdminNotificationTemplateItem {
  const o = v as Record<string, unknown>;
  return {
    id:            String(o.id ?? ''),
    key:           String(o.key ?? ''),
    channel:       String(o.channel ?? ''),
    locale:        String(o.locale ?? ''),
    category:      String(o.category ?? ''),
    status:        String(o.status ?? ''),
    titleTemplate: String(o.titleTemplate ?? ''),
    bodyTemplate:  String(o.bodyTemplate ?? ''),
    createdAt:     String(o.createdAt ?? ''),
    updatedAt:     String(o.updatedAt ?? ''),
  };
}

export async function fetchAdminNotificationTemplates(
  token: string,
  page = 1,
  limit = 50,
): Promise<AdminPaginatedResponse<AdminNotificationTemplateItem>> {
  const envelope = await adminApiClient.get(
    '/admin/notifications/templates',
    (v) => decodePaginatedResponse(v, decodeTemplate),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit } },
  );
  return envelope.data;
}

/* ---- Delivery Queue (notification events) ---- */

export type AdminNotificationEventItem = {
  readonly id: string;
  readonly recipientId: string;
  readonly recipientType: string;
  readonly templateId: string;
  readonly category: string;
  readonly channel: string;
  readonly state: string;
  readonly readAt: string | null;
  readonly dismissedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function decodeEvent(v: unknown): AdminNotificationEventItem {
  const o = v as Record<string, unknown>;
  return {
    id:            String(o.id ?? ''),
    recipientId:   String(o.recipientId ?? ''),
    recipientType: String(o.recipientType ?? ''),
    templateId:    String(o.templateId ?? ''),
    category:      String(o.category ?? ''),
    channel:       String(o.channel ?? ''),
    state:         String(o.state ?? ''),
    readAt:        typeof o.readAt === 'string' ? o.readAt : null,
    dismissedAt:   typeof o.dismissedAt === 'string' ? o.dismissedAt : null,
    createdAt:     String(o.createdAt ?? ''),
    updatedAt:     String(o.updatedAt ?? ''),
  };
}

export async function fetchAdminNotificationQueue(
  token: string,
  page = 1,
  limit = 20,
): Promise<AdminPaginatedResponse<AdminNotificationEventItem>> {
  const envelope = await adminApiClient.get(
    '/admin/notifications/queue',
    (v) => decodePaginatedResponse(v, decodeEvent),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit } },
  );
  return envelope.data;
}

/* ---- Reminder Schedules ---- */

export type AdminReminderScheduleItem = {
  readonly id: string;
  readonly ownerId: string;
  readonly ownerType: string;
  readonly kind: string;
  readonly cadence: string;
  readonly nextRunAt: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function decodeSchedule(v: unknown): AdminReminderScheduleItem {
  const o = v as Record<string, unknown>;
  return {
    id:         String(o.id ?? ''),
    ownerId:    String(o.ownerId ?? ''),
    ownerType:  String(o.ownerType ?? ''),
    kind:       String(o.kind ?? ''),
    cadence:    String(o.cadence ?? ''),
    nextRunAt:  String(o.nextRunAt ?? ''),
    status:     String(o.status ?? ''),
    createdAt:  String(o.createdAt ?? ''),
    updatedAt:  String(o.updatedAt ?? ''),
  };
}

export async function fetchAdminReminderSchedules(
  token: string,
  page = 1,
  limit = 20,
  status?: string,
): Promise<AdminPaginatedResponse<AdminReminderScheduleItem>> {
  const envelope = await adminApiClient.get(
    '/admin/notifications/schedules',
    (v) => decodePaginatedResponse(v, decodeSchedule),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit, ...(status ? { status } : {}) } },
  );
  return envelope.data;
}

/* ---- User Preferences ---- */

export type AdminNotificationPreferenceItem = {
  readonly id: string;
  readonly userId: string;
  readonly userType: string;
  readonly channel: string;
  readonly category: string;
  readonly enabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function decodePreference(v: unknown): AdminNotificationPreferenceItem {
  const o = v as Record<string, unknown>;
  return {
    id:        String(o.id ?? ''),
    userId:    String(o.userId ?? ''),
    userType:  String(o.userType ?? ''),
    channel:   String(o.channel ?? ''),
    category:  String(o.category ?? ''),
    enabled:   Boolean(o.enabled),
    createdAt: String(o.createdAt ?? ''),
    updatedAt: String(o.updatedAt ?? ''),
  };
}

export async function fetchAdminNotificationPreferences(
  token: string,
  page = 1,
  limit = 20,
): Promise<AdminPaginatedResponse<AdminNotificationPreferenceItem>> {
  const envelope = await adminApiClient.get(
    '/admin/notifications/preferences',
    (v) => decodePaginatedResponse(v, decodePreference),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit } },
  );
  return envelope.data;
}

/* ---- Audit Log ---- */

export type AdminNotificationAuditLogItem = {
  readonly id: string;
  readonly actorId: string | null;
  readonly actorType: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly createdAt: string;
};

function decodeAuditLog(v: unknown): AdminNotificationAuditLogItem {
  const o = v as Record<string, unknown>;
  return {
    id:         String(o.id ?? ''),
    actorId:    typeof o.actorId === 'string' ? o.actorId : null,
    actorType:  String(o.actorType ?? ''),
    action:     String(o.action ?? ''),
    entityType: String(o.entityType ?? ''),
    entityId:   String(o.entityId ?? ''),
    createdAt:  String(o.createdAt ?? ''),
  };
}

export async function fetchAdminNotificationAuditLogs(
  token: string,
  page = 1,
  limit = 50,
  filters?: { actorId?: string; action?: string },
): Promise<AdminPaginatedResponse<AdminNotificationAuditLogItem>> {
  const envelope = await adminApiClient.get(
    '/admin/notifications/audit-logs',
    (v) => decodePaginatedResponse(v, decodeAuditLog),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit, ...filters } },
  );
  return envelope.data;
}
