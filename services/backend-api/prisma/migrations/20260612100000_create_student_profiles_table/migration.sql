-- Phase 2 — P2-014
-- Create student_profiles table linked to internal AIM users.
--
-- Scope:
-- Auth, Users, Roles only.
--
-- Security rules:
-- - Student profile data is separate from account identity data.
-- - users.id remains the internal AIM identity and ownership anchor.
-- - Backend authorization, role checks, permission checks, and ownership checks remain final authority.
-- - Clients must not treat submitted user_id or profile IDs as proof of identity or ownership.
-- - No onboarding, placement, lessons, sessions, progress, AIM, recommendations, AI Teacher, or Student Web App data is stored here.
-- - No secrets, service-role keys, database credentials, or privileged backend config are stored here.

CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL UNIQUE,
  profile_type TEXT NOT NULL DEFAULT 'student_profile',

  display_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT,
  timezone TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT student_profiles_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE,

  CONSTRAINT student_profiles_profile_type_check
    CHECK (profile_type = 'student_profile')
);

CREATE INDEX IF NOT EXISTS student_profiles_user_id_idx
  ON student_profiles (user_id);

CREATE INDEX IF NOT EXISTS student_profiles_profile_type_idx
  ON student_profiles (profile_type);

CREATE OR REPLACE FUNCTION set_student_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS student_profiles_set_updated_at ON student_profiles;

CREATE TRIGGER student_profiles_set_updated_at
BEFORE UPDATE ON student_profiles
FOR EACH ROW
EXECUTE FUNCTION set_student_profiles_updated_at();

COMMENT ON TABLE student_profiles IS
  'Student-facing profile data linked to internal AIM users. Backend ownership checks remain final authority.';

COMMENT ON COLUMN student_profiles.user_id IS
  'Owner internal AIM user ID. Must be resolved by the backend from a verified Supabase Auth UID, not trusted from client input.';

COMMENT ON COLUMN student_profiles.profile_type IS
  'Fixed discriminator for student profile records. Does not grant roles or permissions.';
