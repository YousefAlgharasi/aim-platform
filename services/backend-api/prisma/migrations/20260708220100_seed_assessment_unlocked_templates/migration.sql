-- Seed the "assessment_unlocked" notification template — sent when a
-- student finishes every lesson in a chapter that has a gated assessment.
-- ON CONFLICT is safe to run multiple times.

INSERT INTO notification_templates (key, channel, locale, category, title_template, body_template, status)
VALUES
  ('assessment_unlocked', 'in_app', 'en', 'assessment_result',
    'Your {{assessment_title}} is ready',
    'You completed {{chapter_title}} — start your {{assessment_title}} now.',
    'active'),
  ('assessment_unlocked', 'push', 'en', 'assessment_result',
    'Your {{assessment_title}} is ready',
    'You completed {{chapter_title}} — start your {{assessment_title}} now.',
    'active'),
  ('assessment_unlocked', 'in_app', 'ar', 'assessment_result',
    'تقييم {{assessment_title}} جاهز الآن',
    'أكملت {{chapter_title}} — ابدأ الآن تقييم {{assessment_title}}.',
    'active'),
  ('assessment_unlocked', 'push', 'ar', 'assessment_result',
    'تقييم {{assessment_title}} جاهز الآن',
    'أكملت {{chapter_title}} — ابدأ الآن تقييم {{assessment_title}}.',
    'active')
ON CONFLICT (key, channel, locale) DO NOTHING;
