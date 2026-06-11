-- Phase 2 — P2-013
-- Create internal users table linked to Supabase Auth UID.
--
-- Scope:
-- Auth, Users, Roles only.
--
-- Security rules:
-- - Supabase Auth UID is mapped to an internal AIM user record.
-- - Backend remains final authority for identity, roles, permissions, and ownership.
-- - Clients must not treat submitted user IDs, roles, permissions, or status values as authority.
-- - No secrets, service-role keys, database credentials, or privileged backend config are stored here.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  supabase_auth_uid UUID NOT NULL UNIQUE,

  email TEXT,
  phone TEXT,

  user_type TEXT NOT NULL DEFAULT 'student',
  status TEXT NOT NULL DEFAULT 'active',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT users_user_type_check
    CHECK (user_type IN ('student', 'admin', 'reviewer', 'support', 'system')),

  CONSTRAINT users_status_check
    CHECK (status IN ('active', 'pending', 'disabled', 'deleted'))
);

CREATE INDEX IF NOT EXISTS users_supabase_auth_uid_idx
  ON users (supabase_auth_uid);

CREATE INDEX IF NOT EXISTS users_email_idx
  ON users (email);

CREATE INDEX IF NOT EXISTS users_status_idx
  ON users (status);

CREATE INDEX IF NOT EXISTS users_user_type_idx
  ON users (user_type);

CREATE OR REPLACE FUNCTION set_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_users_updated_at();

COMMENT ON TABLE users IS
  'Internal AIM users table linked to Supabase Auth UID. Backend authorization remains final authority.';

COMMENT ON COLUMN users.supabase_auth_uid IS
  'Verified Supabase Auth UID mapped to an internal AIM user. Must not be trusted from client input.';
