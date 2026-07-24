// Admin notifications API client
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

/* ---- Admin Broadcasts ---- */

export type AdminBroadcastItem = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly channel: string;
  readonly audience: string;
  readonly schedule: string;
  readonly status: string;
  readonly lastRunAt: string | null;
  readonly nextRunAt: string | null;
  readonly sentCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateBroadcastPayload = {
  readonly title: string;
  readonly body: string;
  readonly channel: 'in_app' | 'push' | 'email';
  readonly audience: 'all' | 'free' | 'students' | 'parents';
  readonly schedule: 'once' | 'daily' | 'weekly' | 'monthly';
};

function decodeBroadcast(v: unknown): AdminBroadcastItem {
  const o = v as Record<string, unknown>;
  return {
    id:         String(o.id ?? ''),
    title:      String(o.title ?? ''),
    body:       String(o.body ?? ''),
    channel:    String(o.channel ?? ''),
    audience:   String(o.audience ?? ''),
    schedule:   String(o.schedule ?? ''),
    status:     String(o.status ?? ''),
    lastRunAt:  typeof o.lastRunAt === 'string' ? o.lastRunAt : null,
    nextRunAt:  typeof o.nextRunAt === 'string' ? o.nextRunAt : null,
    sentCount:  Number(o.sentCount ?? 0),
    createdAt:  String(o.createdAt ?? ''),
    updatedAt:  String(o.updatedAt ?? ''),
  };
}

export async function fetchAdminBroadcasts(
  token: string,
  page = 1,
  limit = 20,
): Promise<AdminPaginatedResponse<AdminBroadcastItem>> {
  const envelope = await adminApiClient.get(
    '/admin/notifications/broadcasts',
    (v) => decodePaginatedResponse(v, decodeBroadcast),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit } },
  );
  return envelope.data;
}

export async function createAdminBroadcast(
  token: string,
  payload: CreateBroadcastPayload,
): Promise<AdminBroadcastItem> {
  const envelope = await adminApiClient.post(
    '/admin/notifications/broadcasts',
    decodeBroadcast,
    { headers: { authorization: `Bearer ${token}` }, body: payload },
  );
  return envelope.data;
}

export async function runAdminBroadcastNow(token: string, id: string): Promise<{ sent: number }> {
  const envelope = await adminApiClient.post(
    `/admin/notifications/broadcasts/${encodeURIComponent(id)}/run`,
    (v) => v as { sent: number },
    { headers: { authorization: `Bearer ${token}` }, body: {} },
  );
  return envelope.data;
}

export async function disableAdminBroadcast(token: string, id: string): Promise<AdminBroadcastItem> {
  const envelope = await adminApiClient.patch(
    `/admin/notifications/broadcasts/${encodeURIComponent(id)}/disable`,
    decodeBroadcast,
    { headers: { authorization: `Bearer ${token}` }, body: {} },
  );
  return envelope.data;
}

export async function enableAdminBroadcast(token: string, id: string): Promise<AdminBroadcastItem> {
  const envelope = await adminApiClient.patch(
    `/admin/notifications/broadcasts/${encodeURIComponent(id)}/enable`,
    decodeBroadcast,
    { headers: { authorization: `Bearer ${token}` }, body: {} },
  );
  return envelope.data;
}

export async function deleteAdminBroadcast(token: string, id: string): Promise<void> {
  await adminApiClient.delete(
    `/admin/notifications/broadcasts/${encodeURIComponent(id)}`,
    (v) => v as { deleted: boolean },
    { headers: { authorization: `Bearer ${token}` } },
  );
}
