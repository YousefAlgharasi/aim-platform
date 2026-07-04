-- Enable RLS on the 8 tables flagged by Supabase's security advisor as
-- fully exposed to the anon/authenticated roles (no RLS at all).
--
-- Strategy: same as every other table in this schema (see
-- 20260617110000_apply_foundation_rls_policies) — Backend-first. The
-- NestJS backend connects via DATABASE_URL using a role that bypasses RLS
-- (Supabase pooler / postgres role), so enabling RLS here has zero effect
-- on backend reads/writes. It only removes the anon/authenticated
-- exposure that PostgREST/Supabase client libraries would otherwise have.
--
-- No permissive policies are added: default-deny for anon/authenticated,
-- identical to the rest of this schema. None of these 8 tables are
-- append-only audit logs, so no additional restrictive UPDATE/DELETE
-- policies are needed beyond the default deny.

ALTER TABLE student_learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_broadcast_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_level_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_focus_directives ENABLE ROW LEVEL SECURITY;
