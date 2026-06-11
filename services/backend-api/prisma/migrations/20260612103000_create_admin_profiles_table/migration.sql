-- Phase 2 — P2-015
-- Create admin_profiles table linked to internal AIM users.
--
-- Scope:
-- Auth, Users, Roles only.
--
-- Security rules:
-- - Admin profile data is separate from account identity and student profile data.
-- - Admin profile existence does not grant admin authority.
-- - Admin access must come from backend-approved role and permission checks.
-- - Backend authorization, role checks, permission checks, and ownership checks remain final authority.
-- - Admin Dashboard role/profile behavior is UX only, not security authority.
-- - No onboarding, placement, lessons, sessions, progress, AIM, recommendations, AI Teacher, or Student Web App data is stored here.
-- - No secrets, service-role keys, database credentials, or privileged backend config are stored here.

CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL UNIQUE,
  profile_type TEXT NOT NULL DEFAULT 'admin_profile',

  display_name TEXT,
  avatar_url TEXT,
  department TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT admin_profiles_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE,

  CONSTRAINT admin_profiles_profile_type_check
    CHECK (profile_type = 'admin_profile')
);

CREATE INDEX IF NOT EXISTS admin_profiles_user_id_idx
  ON admin_profiles (user_id);

CREATE INDEX IF NOT EXISTS admin_profiles_profile_type_idx
  ON admin_profiles (profile_type);

CREATE INDEX IF NOT EXISTS admin_profiles_department_idx
  ON admin_profiles (department);

CREATE OR REPLACE FUNCTION set_admin_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_profiles_set_updated_at ON admin_profiles;

CREATE TRIGGER admin_profiles_set_updated_at
BEFORE UPDATE ON admin_profiles
FOR EACH ROW
EXECUTE FUNCTION set_admin_profiles_updated_at();

COMMENT ON TABLE admin_profiles IS
  'Admin-facing profile data linked to internal AIM users. Role and permission checks remain the source of admin authority.';

COMMENT ON COLUMN admin_profiles.user_id IS
  'Linked internal AIM user ID. Must be resolved by backend identity and authorization checks, not trusted from client input.';

COMMENT ON COLUMN admin_profiles.profile_type IS
  'Fixed discriminator for admin profile records. Does not grant roles or permissions.';

COMMENT ON COLUMN admin_profiles.department IS
  'Optional safe admin grouping for profile display and operations context. Not an authorization source.';
