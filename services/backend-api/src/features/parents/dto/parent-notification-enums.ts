// P12-039: Create Parent Notification Preferences API
// Mirrors the CHECK constraints on parent_notification_preferences (see
// prisma/migrations/20260620004000_create_parent_notification_preferences_table).

export const PARENT_NOTIFICATION_CHANNELS = ['email', 'sms', 'push'] as const;
export type ParentNotificationChannel = (typeof PARENT_NOTIFICATION_CHANNELS)[number];

export const PARENT_NOTIFICATION_CATEGORIES = [
  'progress_update',
  'assessment_result',
  'deadline_reminder',
  'weekly_summary',
  'system_alert',
] as const;
export type ParentNotificationCategory = (typeof PARENT_NOTIFICATION_CATEGORIES)[number];
