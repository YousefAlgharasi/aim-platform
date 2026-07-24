'use server';

import { getAdminToken } from '../../../../../lib/api/admin-token';
import { requireAdminServerActionAuth } from '../../../../../lib/auth';
import { fetchNotificationAuditLogs, fetchNotificationTemplates, type NotificationAuditLog, type NotificationTemplate } from '../../../../../lib/api/admin-notification-analytics-api';

export async function loadNotificationAuditLogs(limit = 50, offset = 0, eventType?: string): Promise<NotificationAuditLog[]> {
  await requireAdminServerActionAuth();
  const token = await getAdminToken();
  return fetchNotificationAuditLogs(token, limit, offset, eventType);
}

export async function loadNotificationTemplates(): Promise<NotificationTemplate[]> {
  await requireAdminServerActionAuth();
  const token = await getAdminToken();
  return fetchNotificationTemplates(token);
}

