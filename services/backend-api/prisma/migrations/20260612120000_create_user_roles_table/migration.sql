-- Phase 2 — P2-017
-- Create user_roles junction table for assigning roles to internal users.
--
-- Scope:
-- Auth, Users, Roles only.
--
-- Security rules:
-- - Role assignment is a privileged backend operation.
-- - Backend remains final authority for role membership, authorization, and ownership checks.
-- - Clients must not treat role assignment data as authorization authority.
-- - No secrets, service-role keys, database credentials, or privileged backend config are stored here.
-- - Direct client mutation is denied by default through RLS; backend-controlled services own mutations.

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL,
  role_id UUID NOT NULL,

  assigned_by UUID,

  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT user_roles_user_id_role_id_unique
    UNIQUE (user_id, role_id),

  CONSTRAINT user_roles_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE,

  CONSTRAINT user_roles_role_id_fkey
    FOREIGN KEY (role_id)
    REFERENCES roles (id)
    ON DELETE CASCADE,

  CONSTRAINT user_roles_assigned_by_fkey
    FOREIGN KEY (assigned_by)
    REFERENCES users (id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx
  ON user_roles (user_id);

CREATE INDEX IF NOT EXISTS user_roles_role_id_idx
  ON user_roles (role_id);

CREATE INDEX IF NOT EXISTS user_roles_assigned_by_idx
  ON user_roles (assigned_by);

CREATE INDEX IF NOT EXISTS user_roles_assigned_at_idx
  ON user_roles (assigned_at);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE user_roles IS
  'Backend-owned junction table assigning roles to internal AIM users. Backend authorization remains final authority for role membership.';

COMMENT ON COLUMN user_roles.user_id IS
  'Internal AIM user receiving the role assignment. Must be resolved from a verified Supabase Auth UID by the backend.';

COMMENT ON COLUMN user_roles.role_id IS
  'Backend-owned role being assigned. Clients must not treat this value as a trust boundary.';

COMMENT ON COLUMN user_roles.assigned_by IS
  'Internal AIM user ID of the admin who performed the assignment. Nullable to support system-generated assignments.';

COMMENT ON COLUMN user_roles.assigned_at IS
  'Timestamp of role assignment for audit context.';
