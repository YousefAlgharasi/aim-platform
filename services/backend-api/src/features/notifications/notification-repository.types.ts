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
  device_name: string | null;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationEventRow {
  id: string;
  user_id: string;
  template_id: string;
  channel: string;
  category: string;
  status: string;
  title: string;
  body: string;
  scheduled_at: string | null;
  sent_at: string | null;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderScheduleRow {
  id: string;
  user_id: string;
  reminder_type: string;
  status: string;
  reference_id: string | null;
  cron_expression: string;
  next_fire_at: string | null;
  last_fired_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAttemptRow {
  id: string;
  notification_event_id: string;
  channel: string;
  status: string;
  attempt_number: number;
  error_code: string | null;
  error_message: string | null;
  attempted_at: string;
  created_at: string;
}

export interface NotificationDigestRow {
  id: string;
  user_id: string;
  frequency: string;
  status: string;
  period_start: string;
  period_end: string;
  event_count: number;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuietHoursRow {
  id: string;
  user_id: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationAuditLogRow {
  id: string;
  user_id: string;
  event_type: string;
  resource_id: string | null;
  resource_type: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
