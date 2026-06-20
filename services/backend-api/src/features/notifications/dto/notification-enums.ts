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

export const NOTIFICATION_TEMPLATE_STATUSES = ['active', 'disabled'] as const;
export type NotificationTemplateStatus = (typeof NOTIFICATION_TEMPLATE_STATUSES)[number];

export const NOTIFICATION_LOCALES = ['en', 'ar'] as const;
export type NotificationLocale = (typeof NOTIFICATION_LOCALES)[number];

export const NOTIFICATION_EVENT_STATUSES = [
  'scheduled',
  'queued',
  'sent',
  'failed',
  'dismissed',
  'read',
] as const;
export type NotificationEventStatus = (typeof NOTIFICATION_EVENT_STATUSES)[number];

export const NOTIFICATION_USER_TYPES = ['student', 'parent'] as const;
export type NotificationUserType = (typeof NOTIFICATION_USER_TYPES)[number];

export const DEVICE_TOKEN_PLATFORMS = ['ios', 'android', 'web'] as const;
export type DeviceTokenPlatform = (typeof DEVICE_TOKEN_PLATFORMS)[number];

export const DEVICE_TOKEN_STATUSES = ['active', 'disabled', 'expired'] as const;
export type DeviceTokenStatus = (typeof DEVICE_TOKEN_STATUSES)[number];

export const REMINDER_TYPES = [
  'learning_plan',
  'review_schedule',
  'deadline',
  'streak',
  'custom',
] as const;
export type ReminderType = (typeof REMINDER_TYPES)[number];

export const REMINDER_SCHEDULE_STATUSES = ['active', 'paused', 'completed', 'cancelled'] as const;
export type ReminderScheduleStatus = (typeof REMINDER_SCHEDULE_STATUSES)[number];

export const DELIVERY_ATTEMPT_STATUSES = ['pending', 'success', 'failed'] as const;
export type DeliveryAttemptStatus = (typeof DELIVERY_ATTEMPT_STATUSES)[number];

export const DIGEST_FREQUENCIES = ['daily', 'weekly'] as const;
export type DigestFrequency = (typeof DIGEST_FREQUENCIES)[number];

export const DIGEST_STATUSES = ['pending', 'sent', 'failed'] as const;
export type DigestStatus = (typeof DIGEST_STATUSES)[number];

export const NOTIFICATION_AUDIT_EVENT_TYPES = [
  'preference_updated',
  'token_registered',
  'token_disabled',
  'schedule_created',
  'schedule_paused',
  'schedule_cancelled',
  'notification_sent',
  'notification_failed',
  'notification_read',
  'notification_dismissed',
  'quiet_hours_updated',
  'rate_limit_hit',
  'digest_sent',
] as const;
export type NotificationAuditEventType = (typeof NOTIFICATION_AUDIT_EVENT_TYPES)[number];
