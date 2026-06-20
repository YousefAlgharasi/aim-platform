// P13-020: Create Notification DTOs and Entities
// Shared enums for the notification/reminder domain. Values must match the
// CHECK constraints defined in the Phase 13 migrations.

export type NotificationChannel = 'in_app' | 'push' | 'email';

export type NotificationCategory =
  | 'learning_reminder'
  | 'deadline_reminder'
  | 'progress_update'
  | 'assessment_result'
  | 'parent_summary'
  | 'system_alert';

export type NotificationLocale = 'en' | 'ar';

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

export type DeviceTokenPlatform = 'ios' | 'android';

export type DeviceTokenStatus = 'active' | 'revoked' | 'stale';

export type ReminderScheduleKind =
  | 'learning_plan'
  | 'review'
  | 'deadline'
  | 'streak'
  | 'custom';

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
