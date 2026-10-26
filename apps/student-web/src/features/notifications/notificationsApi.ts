import { apiClient } from '../../api/client';
import { t } from '../../i18n';

// Backend: services/backend-api/src/features/notifications/{inbox,preferences,reminders}.controller.ts
// Controllers are mounted at `api/v1/notifications` on the backend, so the
// client path keeps that prefix (the web client's own `/api` base is stripped
// by the proxy). Responses are raw DB rows → snake_case keys
// (notification-repository.types.ts).

const BASE = '/api/v1/notifications';

export const NOTIFICATION_CHANNELS = ['in_app', 'push', 'email'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_CATEGORIES = [
  'learning_reminder',
  'deadline_reminder',
  'progress_update',
  'assessment_result',
  'parent_summary',
  'system_alert',
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  in_app: 'In-app',
  push: 'Push',
  email: 'Email',
};

export const CATEGORY_LABELS: Record<string, string> = {
  learning_reminder: 'Learning reminders',
  deadline_reminder: 'Deadline reminders',
  progress_update: 'Progress updates',
  assessment_result: 'Assessment results',
  parent_summary: 'Progress digests',
  system_alert: 'System alerts',
};

/** Translated channel name (resolved at call time so it follows the active language). */
export function channelLabel(channel: string): string {
  const key = CHANNEL_LABELS[channel as NotificationChannel];
  return key ? t(key) : channel;
}

/** Translated category name; unknown categories fall back to the raw value. */
export function categoryLabel(category: string): string {
  const key = CATEGORY_LABELS[category];
  return key ? t(key) : category;
}

export interface NotificationEvent {
  id: string;
  recipient_id: string;
  recipient_type: string;
  template_id: string;
  category: string;
  channel: string;
  payload: { title?: unknown; body?: unknown; [key: string]: unknown };
  state: string;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  user_type: string;
  channel: string;
  category: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/** A quiet-hours row exists only while quiet hours are enabled (no `enabled` column). */
export interface QuietHours {
  id: string;
  user_id: string;
  user_type: string;
  start_time: string;
  end_time: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderSchedule {
  id: string;
  owner_id: string;
  owner_type: string;
  kind: string;
  cadence: string;
  next_run_at: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled' | string;
  created_at: string;
  updated_at: string;
}

export const INBOX_PAGE_SIZE = 20;

export function isUnread(n: NotificationEvent): boolean {
  return !n.read_at && n.state !== 'read' && n.state !== 'dismissed';
}

export function fetchInbox(limit = INBOX_PAGE_SIZE, offset = 0): Promise<NotificationEvent[]> {
  return apiClient.get<NotificationEvent[]>(`${BASE}/inbox?limit=${limit}&offset=${offset}`);
}

/** Unread in-app notification count — suitable for a header badge. */
export async function fetchUnreadCount(): Promise<number> {
  const res = await apiClient.get<{ count: number }>(`${BASE}/inbox/unread-count`);
  return res.count ?? 0;
}

export function markNotificationRead(eventId: string): Promise<NotificationEvent> {
  return apiClient.patch<NotificationEvent>(`${BASE}/inbox/${encodeURIComponent(eventId)}/read`, {});
}

export function dismissNotification(eventId: string): Promise<NotificationEvent> {
  return apiClient.patch<NotificationEvent>(`${BASE}/inbox/${encodeURIComponent(eventId)}/dismiss`, {});
}

export function fetchPreferences(): Promise<NotificationPreference[]> {
  return apiClient.get<NotificationPreference[]>(`${BASE}/preferences`);
}

export function updatePreference(
  channel: NotificationChannel,
  category: NotificationCategory,
  enabled: boolean,
): Promise<NotificationPreference> {
  return apiClient.patch<NotificationPreference>(`${BASE}/preferences`, { channel, category, enabled });
}

export function fetchQuietHours(): Promise<QuietHours | null> {
  return apiClient.get<QuietHours | null>(`${BASE}/quiet-hours`);
}

export function updateQuietHours(input: {
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
}): Promise<QuietHours | null> {
  return apiClient.patch<QuietHours | null>(`${BASE}/quiet-hours`, input);
}

export function fetchReminders(): Promise<ReminderSchedule[]> {
  return apiClient.get<ReminderSchedule[]>(`${BASE}/reminders`);
}

export function setReminderStatus(
  scheduleId: string,
  action: 'pause' | 'resume' | 'cancel',
): Promise<ReminderSchedule> {
  return apiClient.patch<ReminderSchedule>(`${BASE}/reminders/${encodeURIComponent(scheduleId)}/${action}`, {});
}
