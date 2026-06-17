-- Apply RLS policies for Phase 3 curriculum, Phase 4 placement, and Phase 5 AIM tables.
--
-- Strategy: Backend-first. The NestJS backend owns authorization and connects with
-- backend-controlled credentials. RLS is defense-in-depth for direct Supabase
-- PostgREST/anon/authenticated access.
--
-- Default: deny all direct client access. No permissive policies are created here.
-- Future direct-access policies must be added only for a specific reviewed use case.
--
-- Security rules:
-- - Supabase anon role has no access to these tables.
-- - Supabase authenticated role has no direct access to these tables.
-- - Curriculum, placement, and AIM reads/writes must go through Backend API guards.
-- - Audit logs are append-only from application code and hidden from direct clients.
-- - No secrets, service-role keys, database credentials, or provider keys are stored here.

-- -----------------------------------------------------------------------
-- Prisma migration metadata
-- -----------------------------------------------------------------------

-- Prisma creates this table in public to track applied migrations. It should
-- never be readable or writable by Supabase anon/authenticated clients.
ALTER TABLE _prisma_migrations ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------
-- Phase 3 curriculum and content tables
-- -----------------------------------------------------------------------

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_skill_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_audit_logs ENABLE ROW LEVEL SECURITY;

-- Explicit restrictive policies for append-only curriculum audit logs.
-- No SELECT/INSERT policies are added for direct clients.

CREATE POLICY curriculum_audit_logs_deny_update
  ON curriculum_audit_logs
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY curriculum_audit_logs_deny_delete
  ON curriculum_audit_logs
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (false);

-- -----------------------------------------------------------------------
-- Phase 4 placement tables
-- -----------------------------------------------------------------------

ALTER TABLE placement_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_question_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE initial_learning_path ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_audit_log ENABLE ROW LEVEL SECURITY;

-- Explicit restrictive policies for append-only placement audit logs.
-- No SELECT/INSERT policies are added for direct clients.

CREATE POLICY placement_audit_log_deny_update
  ON placement_audit_log
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY placement_audit_log_deny_delete
  ON placement_audit_log
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (false);

-- -----------------------------------------------------------------------
-- Phase 5 AIM and learning runtime tables
-- -----------------------------------------------------------------------

ALTER TABLE student_skill_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weakness_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulty_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE aim_audit_log ENABLE ROW LEVEL SECURITY;

-- Explicit restrictive policies for append-only AIM audit logs.
-- No SELECT/INSERT policies are added for direct clients.

CREATE POLICY aim_audit_log_deny_update
  ON aim_audit_log
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY aim_audit_log_deny_delete
  ON aim_audit_log
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (false);

-- -----------------------------------------------------------------------
-- Trigger function search paths
-- -----------------------------------------------------------------------

-- Supabase security advisor flags public trigger functions with mutable
-- search_path. Pin them to public plus pg_temp so object resolution cannot be
-- influenced by the caller's role search_path.

ALTER FUNCTION public.set_users_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_roles_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_permissions_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_student_profiles_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_admin_profiles_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_courses_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_levels_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_chapters_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_skills_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_objectives_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_lessons_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_question_bank_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_question_choices_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_question_answers_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_questions_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_lesson_assets_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_placement_sections_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_placement_attempts_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_placement_questions_updated_at() SET search_path = public, pg_temp;
