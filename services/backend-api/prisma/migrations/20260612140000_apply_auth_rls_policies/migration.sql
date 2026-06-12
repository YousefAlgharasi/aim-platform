-- Phase 2 — P2-020
-- Apply RLS policies for all Phase 2 auth-related tables.
--
-- Strategy: Backend-first. NestJS backend connects via service role (bypasses RLS).
-- RLS is defense-in-depth against direct PostgREST/anon/authenticated role access.
-- Default: deny all. Explicit permissive policies added only where safe and intentional.
--
-- Security rules:
-- - Backend service role bypasses RLS automatically. No policy needed for backend access.
-- - Supabase anon role has no access to any Phase 2 table.
-- - Supabase authenticated role access is limited to own-data reads on safe tables only.
-- - admin_profiles and auth_audit_logs are fully denied to all non-service roles.
-- - No secrets, service-role keys, database credentials, or privileged config stored here.

-- -----------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own
  ON users
  FOR SELECT
  TO authenticated
  USING (supabase_auth_uid = auth.uid());

-- -----------------------------------------------------------------------
-- student_profiles
-- -----------------------------------------------------------------------

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY student_profiles_select_own
  ON student_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_auth_uid = auth.uid()
    )
  );

-- -----------------------------------------------------------------------
-- admin_profiles — full deny; no permissive policies
-- -----------------------------------------------------------------------

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- No permissive policies. RLS enabled with no policies = deny all for non-service roles.

-- -----------------------------------------------------------------------
-- roles
-- -----------------------------------------------------------------------

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY roles_select_authenticated
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------
-- permissions
-- -----------------------------------------------------------------------

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY permissions_select_authenticated
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------
-- role_permissions
-- -----------------------------------------------------------------------

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY role_permissions_select_authenticated
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------
-- user_roles
-- -----------------------------------------------------------------------

-- RLS already enabled via P2-017 migration. Add explicit policy.

CREATE POLICY user_roles_select_own
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_auth_uid = auth.uid()
    )
  );

-- -----------------------------------------------------------------------
-- auth_audit_logs — full deny; no permissive policies
-- -----------------------------------------------------------------------

-- RLS already enabled via P2-018 migration.
-- Append-only enforcement: no UPDATE or DELETE policies for any role.
-- No SELECT policies: audit log is internal only.

-- Explicit restrictive policies to enforce append-only at RLS level.

CREATE POLICY auth_audit_logs_deny_update
  ON auth_audit_logs
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY auth_audit_logs_deny_delete
  ON auth_audit_logs
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (false);
