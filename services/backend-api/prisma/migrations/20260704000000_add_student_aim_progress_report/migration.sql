-- P20-023: Add the student_aim_progress report definition.
-- Unlike the other seeded report definitions (P15-021), this one is
-- executed by a dedicated code path (StudentAimProgressReportService) that
-- reads student_skill_states/weakness_records/review_schedules directly,
-- not the generic metric_aggregates/analytics_events mechanism.

INSERT INTO report_definitions (id, key, name, description, category, allowed_roles, parameters_schema, is_active)
VALUES
  (
    'f1000000-0000-0000-0000-000000000005',
    'student_aim_progress',
    'My AIM Progress',
    'Real per-skill mastery, open/recently-resolved weaknesses, and upcoming due reviews for the logged-in student, computed from AIM Engine output.',
    'student',
    ARRAY['student'],
    '{}'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;
