-- Notification templates for the Improve "retry is ready" nudge (category learning_reminder, so the student's
-- existing learning-reminder preference and quiet hours apply). {{extra}} is "" or " (+N more)".
INSERT INTO notification_templates (key, channel, locale, category, status, title_template, body_template) VALUES
  ('recovery_retry_ready', 'in_app', 'en', 'learning_reminder', 'active',
   'Your {{group}} retry is ready',
   'It has been 3 days since you missed {{skill}}{{extra}}. A quick retry now helps it stick and lifts your mastery.'),
  ('recovery_retry_ready', 'in_app', 'ar', 'learning_reminder', 'active',
   'إعادة محاولة {{group}} جاهزة',
   'مرّت 3 أيام على خطئك في {{skill}}{{extra}}. محاولة سريعة الآن تثبّت المعلومة وترفع مستوى إتقانك.'),
  ('recovery_retry_ready', 'push', 'en', 'learning_reminder', 'active',
   'Your {{group}} retry is ready',
   'It has been 3 days since you missed {{skill}}{{extra}}. Retry now to lift your mastery.'),
  ('recovery_retry_ready', 'push', 'ar', 'learning_reminder', 'active',
   'إعادة محاولة {{group}} جاهزة',
   'مرّت 3 أيام على خطئك في {{skill}}{{extra}}. أعد المحاولة الآن لترفع مستوى إتقانك.')
ON CONFLICT (key, channel, locale) DO NOTHING;
