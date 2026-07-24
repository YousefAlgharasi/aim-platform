// P11-010: Admin session summaries and audit/activity log API clients (read-only)
import { adminApiClient } from './admin-api-client';
import { decodePaginatedResponse, type AdminPaginatedResponse } from './admin-paginated-response';

/* ---- Session Summaries ---- */

export type AdminSessionSummaryItem = {
  readonly id: string;
  readonly studentId: string;
  readonly startedAt: string;
  readonly endedAt: string | null;
  readonly feedbackSummary: string | null;
};

function decodeSessionSummary(v: unknown): AdminSessionSummaryItem {
  const o = v as Record<string, unknown>;
  return {
    id:              String(o.id ?? ''),
    studentId:       String(o.studentId ?? ''),
    startedAt:       String(o.startedAt ?? ''),
    endedAt:         typeof o.endedAt === 'string' ? o.endedAt : null,
    feedbackSummary: typeof o.feedbackSummary === 'string' ? o.feedbackSummary : null,
  };
}

export async function fetchAdminSessionSummaries(
  token: string,
  page = 1,
  limit = 20,
  studentId?: string,
): Promise<AdminPaginatedResponse<AdminSessionSummaryItem>> {
  const envelope = await adminApiClient.get(
    '/admin/session-summaries',
    (v) => decodePaginatedResponse(v, decodeSessionSummary),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit, ...(studentId ? { studentId } : {}) } },
  );
  return envelope.data;
}

export async function fetchAdminSessionSummaryDetail(
  token: string,
  id: string,
): Promise<AdminSessionSummaryItem> {
  const envelope = await adminApiClient.get(
    `/admin/session-summaries/${id}`,
    decodeSessionSummary,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

/* ---- AIM Audit Logs ---- */

export type AdminAuditLogItem = {
  readonly id: string;
  readonly userId: string;
  readonly action: string;
  readonly entityType: string | null;
  readonly entityId: string | null;
  readonly createdAt: string;
};

function decodeAuditLog(v: unknown): AdminAuditLogItem {
  const o = v as Record<string, unknown>;
  return {
    id:         String(o.id ?? ''),
    userId:     String(o.userId ?? ''),
    action:     String(o.action ?? ''),
    entityType: typeof o.entityType === 'string' ? o.entityType : null,
    entityId:   typeof o.entityId   === 'string' ? o.entityId   : null,
    createdAt:  String(o.createdAt ?? ''),
  };
}

export async function fetchAdminAuditLogs(
  token: string,
  page = 1,
  limit = 20,
  filters?: { userId?: string; action?: string; from?: string; to?: string },
): Promise<AdminPaginatedResponse<AdminAuditLogItem>> {
  const envelope = await adminApiClient.get(
    '/admin/audit-logs',
    (v) => decodePaginatedResponse(v, decodeAuditLog),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit, ...filters } },
  );
  return envelope.data;
}

/* ---- Activity Logs ---- */

export type AdminActivityLogItem = {
  readonly id: string;
  readonly userId: string;
  readonly eventType: string;
  readonly createdAt: string;
};

function decodeActivityLog(v: unknown): AdminActivityLogItem {
  const o = v as Record<string, unknown>;
  return {
    id:        String(o.id ?? ''),
    userId:    String(o.userId ?? ''),
    eventType: String(o.eventType ?? ''),
    createdAt: String(o.createdAt ?? ''),
  };
}

export async function fetchAdminActivityLogs(
  token: string,
  page = 1,
  limit = 20,
  filters?: { userId?: string; eventType?: string; from?: string; to?: string },
): Promise<AdminPaginatedResponse<AdminActivityLogItem>> {
  const envelope = await adminApiClient.get(
    '/admin/activity-logs',
    (v) => decodePaginatedResponse(v, decodeActivityLog),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit, ...filters } },
  );
  return envelope.data;
}
