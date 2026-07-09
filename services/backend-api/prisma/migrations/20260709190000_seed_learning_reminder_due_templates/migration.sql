-- Seed the "learning_reminder_due" notification template — sent by
-- NotificationReminderScheduler when a student's learning-plan/review
-- reminder schedule comes due (LearningReminderIntegration.fireLearningReminder).
-- No template variables are interpolated (variables: {} at the call site).
-- ON CONFLICT is safe to run multiple times.

INSERT INTO notification_templates (key, channel, locale, category, title_template, body_template, status)
VALUES
  ('learning_reminder_due', 'push', 'en', 'learning_reminder',
    'Time to keep learning',
    'You have a lesson waiting — jump back in to keep your streak going.',
    'active'),
  ('learning_reminder_due', 'in_app', 'en', 'learning_reminder',
    'Time to keep learning',
    'You have a lesson waiting — jump back in to keep your streak going.',
    'active'),
  ('learning_reminder_due', 'push', 'ar', 'learning_reminder',
    'حان وقت المتابعة',
    'ينتظرك درس جديد — عد الآن لمتابعة تقدمك.',
    'active'),
  ('learning_reminder_due', 'in_app', 'ar', 'learning_reminder',
    'حان وقت المتابعة',
    'ينتظرك درس جديد — عد الآن لمتابعة تقدمك.',
    'active')
ON CONFLICT (key, channel, locale) DO NOTHING;
