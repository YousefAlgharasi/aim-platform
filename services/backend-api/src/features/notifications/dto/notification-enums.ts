// P13-020: Create Notification DTOs and Entities
// Shared enums for the notification/reminder domain. Values must match the
// CHECK constraints defined in the Phase 13 migrations.

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

export const NOTIFICATION_LOCALES = ['en', 'ar'] as const;
export type NotificationLocale = (typeof NOTIFICATION_LOCALES)[number];

export type NotificationTemplateStatus = 'active' | 'disabled';

export type NotificationRecipientType = 'student' | 'parent';

export type NotificationEventState =
  | 'scheduled'
  | 'queued'
  | 'sent'
  | 'failed'
  | 'delivered'
  | 'dismissed'
  | 'read';

// Must match the `platform` CHECK constraint in the device_tokens migration.
export const DEVICE_TOKEN_PLATFORMS = ['ios', 'android'] as const;
export type DeviceTokenPlatform = (typeof DEVICE_TOKEN_PLATFORMS)[number];

export type DeviceTokenStatus = 'active' | 'revoked' | 'stale';

export const REMINDER_TYPES = ['learning_plan', 'review', 'deadline', 'streak', 'custom'] as const;
export type ReminderScheduleKind = (typeof REMINDER_TYPES)[number];
export type ReminderType = ReminderScheduleKind;

export type ReminderScheduleStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export type DeliveryAttemptStatus = 'pending' | 'success' | 'failed';

export type DigestPeriod = 'daily' | 'weekly';

export type DigestState = 'pending' | 'sent';

export type NotificationAuditActorType = 'student' | 'parent' | 'admin' | 'system';

export type NotificationAuditEntityType =
  | 'notification_template'
  | 'notification_preference'
  | 'device_token'
  | 'notification_event'
  | 'reminder_schedule'
  | 'notification_delivery_attempt'
  | 'notification_digest'
  | 'notification_quiet_hours';
