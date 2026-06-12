-- Phase 2 — P2-018
-- Create auth_audit_logs table for append-only security traceability.
--
-- Scope:
-- Auth, Users, Roles only.
--
-- Security rules:
-- - Append-only. Application code must not UPDATE or DELETE rows.
-- - Contains sensitive auth and role event context. Must not be returned to clients without
--   a backend-confirmed admin permission check.
-- - ip_address and user_agent are stored for security traceability only and must not be
--   exposed to non-admin clients.
-- - No secrets, service-role keys, database credentials, or privileged backend config are stored here.
-- - Backend remains final authority for access to audit log data.

CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID,

  supabase_auth_uid UUID,

  event_type TEXT NOT NULL,

  actor_user_id UUID,

  ip_address TEXT,

  user_agent TEXT,

  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT auth_audit_logs_event_type_check
    CHECK (
      event_type IN (
        'login',
        'logout',
        'token_validated',
        'token_rejected',
        'user_created',
        'user_status_changed',
        'role_assigned',
        'role_removed',
        'profile_updated',
        'profile_access_denied',
        'access_denied',
        'password_reset_requested',
        'email_changed'
      )
    ),

  CONSTRAINT auth_audit_logs_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE SET NULL,

  CONSTRAINT auth_audit_logs_actor_user_id_fkey
    FOREIGN KEY (actor_user_id)
    REFERENCES users (id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS auth_audit_logs_user_id_idx
  ON auth_audit_logs (user_id);

CREATE INDEX IF NOT EXISTS auth_audit_logs_supabase_auth_uid_idx
  ON auth_audit_logs (supabase_auth_uid);

CREATE INDEX IF NOT EXISTS auth_audit_logs_event_type_idx
  ON auth_audit_logs (event_type);

CREATE INDEX IF NOT EXISTS auth_audit_logs_created_at_idx
  ON auth_audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS auth_audit_logs_actor_user_id_idx
  ON auth_audit_logs (actor_user_id);

ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE auth_audit_logs IS
  'Append-only security audit log for auth and role events. Records must not be updated or deleted by application code. Backend authorization is required to access log data.';

COMMENT ON COLUMN auth_audit_logs.user_id IS
  'Internal AIM user ID of the subject of the event. Nullable to support pre-registration and failed-login events.';

COMMENT ON COLUMN auth_audit_logs.supabase_auth_uid IS
  'Supabase Auth UID recorded for events where an internal user record may not yet exist.';

COMMENT ON COLUMN auth_audit_logs.event_type IS
  'Stable event key identifying the security-relevant action being logged.';

COMMENT ON COLUMN auth_audit_logs.actor_user_id IS
  'Internal AIM user ID of the admin or system actor performing the action, if distinct from the subject.';

COMMENT ON COLUMN auth_audit_logs.ip_address IS
  'Client IP address for security traceability. Must not be exposed to non-admin clients.';

COMMENT ON COLUMN auth_audit_logs.user_agent IS
  'Client user agent string for security traceability. Must not be exposed to non-admin clients.';

COMMENT ON COLUMN auth_audit_logs.metadata IS
  'Additional structured event context. Must not contain secrets, credentials, or privileged backend configuration.';
