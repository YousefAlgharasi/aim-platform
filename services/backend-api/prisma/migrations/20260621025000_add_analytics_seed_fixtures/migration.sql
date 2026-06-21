-- P15-021: Add analytics seed fixtures
-- Safe development fixtures for metric definitions, report definitions, and dashboard widgets.
-- No real user data, secrets, or production data.

INSERT INTO metric_definitions (id, key, name, description, domain, value_type, aggregation_method, source_event_types, is_active, version)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'daily_active_students', 'Daily Active Students', 'Distinct students with session/lesson activity in a day', 'learning', 'distinct_count', 'distinct_count', ARRAY['session.started', 'lesson.started'], true, 1),
  ('f0000000-0000-0000-0000-000000000002', 'lesson_completion_rate', 'Lesson Completion Rate', 'Lessons completed divided by lessons started', 'learning', 'rate', 'rate', ARRAY['lesson.started', 'lesson.completed'], true, 1),
  ('f0000000-0000-0000-0000-000000000003', 'assessment_completion_rate', 'Assessment Completion Rate', 'Assessments submitted divided by assessments assigned', 'assessment', 'rate', 'rate', ARRAY['assessment.assigned', 'assessment.submitted'], true, 1),
  ('f0000000-0000-0000-0000-000000000004', 'notification_delivery_rate', 'Notification Delivery Rate', 'Notifications delivered divided by notifications queued', 'notification', 'rate', 'rate', ARRAY['notification.delivered'], true, 1),
  ('f0000000-0000-0000-0000-000000000005', 'active_subscriptions', 'Active Subscriptions', 'Count of subscriptions with active status', 'billing', 'count', 'count', ARRAY['subscription.created', 'subscription.canceled'], true, 1),
  ('f0000000-0000-0000-0000-000000000006', 'new_signups', 'New Signups', 'Count of new user registrations', 'user', 'count', 'count', ARRAY['user.registered'], true, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO report_definitions (id, key, name, description, category, allowed_roles, parameters_schema, is_active)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'admin_learning_overview', 'Admin Learning Overview', 'Aggregate learning activity across the platform', 'learning', ARRAY['admin'], '{"period": "string", "cohortId": "string?"}'::jsonb, true),
  ('f1000000-0000-0000-0000-000000000002', 'parent_child_summary', 'Parent Child Summary', 'Learning and assessment summary for a parent''s own children', 'parent', ARRAY['parent'], '{"childId": "string"}'::jsonb, true),
  ('f1000000-0000-0000-0000-000000000003', 'student_self_summary', 'Student Self Summary', 'Learning and assessment summary for the logged-in student', 'student', ARRAY['student'], '{}'::jsonb, true),
  ('f1000000-0000-0000-0000-000000000004', 'admin_billing_overview', 'Admin Billing Overview', 'Aggregate revenue and subscription metrics', 'billing', ARRAY['admin'], '{"period": "string"}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO dashboard_widgets (id, dashboard_key, widget_type, metric_definition_id, report_definition_id, config, display_order, is_active)
VALUES
  ('f2000000-0000-0000-0000-000000000001', 'admin_overview', 'kpi', 'f0000000-0000-0000-0000-000000000001', NULL, '{"label": "Daily Active Students"}'::jsonb, 1, true),
  ('f2000000-0000-0000-0000-000000000002', 'admin_overview', 'kpi', 'f0000000-0000-0000-0000-000000000005', NULL, '{"label": "Active Subscriptions"}'::jsonb, 2, true),
  ('f2000000-0000-0000-0000-000000000003', 'admin_overview', 'table', NULL, 'f1000000-0000-0000-0000-000000000001', '{"label": "Learning Overview"}'::jsonb, 3, true),
  ('f2000000-0000-0000-0000-000000000004', 'parent_summary', 'table', NULL, 'f1000000-0000-0000-0000-000000000002', '{"label": "Child Summary"}'::jsonb, 1, true),
  ('f2000000-0000-0000-0000-000000000005', 'student_summary', 'table', NULL, 'f1000000-0000-0000-0000-000000000003', '{"label": "My Summary"}'::jsonb, 1, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO analytics_cohorts (id, key, name, description, cohort_type, definition, is_active)
VALUES
  ('f3000000-0000-0000-0000-000000000001', 'all_active_students', 'All Active Students', 'Students with activity in the last 30 days', 'dynamic', '{"rule": "active_within_days", "days": 30}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
