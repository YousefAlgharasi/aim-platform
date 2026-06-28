// Row types must match the real Phase 13 migrations exactly (see
// prisma/migrations/20260620009000..018000_*). These mirror the already
// camelCase dto/*.entity.ts shapes, but as raw snake_case DB rows.

export interface NotificationTemplateRow {
  id: string;
  key: string;
  channel: string;
  locale: string;
  category: string;
  status: string;
  title_template: string;
  body_template: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferenceRow {
  id: string;
  user_id: string;
  user_type: string;
  channel: string;
  category: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceTokenRow {
  id: string;
  user_id: string;
  platform: string;
  token: string;
  status: string;
  device_label: string | null;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationEventRow {
  id: string;
  recipient_id: string;
  recipient_type: string;
  template_id: string;
  category: string;
  channel: string;
  payload: Record<string, unknown>;
  state: string;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderScheduleRow {
  id: string;
  owner_id: string;
  owner_type: string;
  kind: string;
  cadence: string;
  next_run_at: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAttemptRow {
  id: string;
  notification_event_id: string;
  channel: string;
  provider: string;
  attempt_number: number;
  status: string;
  error_code: string | null;
  created_at: string;
}

export interface NotificationDigestRow {
  id: string;
  recipient_id: string;
  recipient_type: string;
  period: string;
  period_start: string;
  period_end: string;
  event_ids: string[];
  state: string;
  created_at: string;
}

export interface QuietHoursRow {
  id: string;
  user_id: string;
  user_type: string;
  start_time: string;
  end_time: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationAuditLogRow {
  id: string;
  actor_id: string | null;
  actor_type: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
