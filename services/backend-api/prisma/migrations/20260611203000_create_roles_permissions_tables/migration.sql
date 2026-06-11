-- Phase 2 — P2-016
-- Create roles, permissions, and role-permission mapping tables.
--
-- Scope:
-- Auth, Users, Roles only.
--
-- Security rules:
-- - Roles and permissions are backend-owned authorization data.
-- - Backend remains final authority for role, permission, and ownership checks.
-- - Clients must not treat returned role or permission values as authorization authority.
-- - No secrets, service-role keys, database credentials, or privileged backend config are stored here.
-- - Direct client access is denied by default through RLS; backend-controlled tooling owns mutations.

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT roles_key_check
    CHECK (key IN ('student', 'admin', 'super_admin', 'reviewer', 'support'))
);

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  key TEXT NOT NULL UNIQUE,
  scope TEXT NOT NULL,
  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT permissions_scope_check
    CHECK (scope IN ('profiles', 'users', 'roles', 'permissions', 'admin.users', 'auth.audit')),

  CONSTRAINT permissions_key_check
    CHECK (
      key IN (
        'profiles.read.own',
        'profiles.update.own',
        'profiles.read.any',
        'profiles.update.any',
        'users.read',
        'users.manage',
        'roles.read',
        'roles.manage',
        'permissions.read',
        'permissions.manage',
        'admin.users.read',
        'admin.users.manage',
        'auth.audit.read'
      )
    )
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL,
  permission_id UUID NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT role_permissions_pkey
    PRIMARY KEY (role_id, permission_id),

  CONSTRAINT role_permissions_role_id_fkey
    FOREIGN KEY (role_id)
    REFERENCES roles (id)
    ON DELETE CASCADE,

  CONSTRAINT role_permissions_permission_id_fkey
    FOREIGN KEY (permission_id)
    REFERENCES permissions (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS roles_key_idx
  ON roles (key);

CREATE INDEX IF NOT EXISTS roles_is_system_idx
  ON roles (is_system);

CREATE INDEX IF NOT EXISTS permissions_key_idx
  ON permissions (key);

CREATE INDEX IF NOT EXISTS permissions_scope_idx
  ON permissions (scope);

CREATE INDEX IF NOT EXISTS role_permissions_role_id_idx
  ON role_permissions (role_id);

CREATE INDEX IF NOT EXISTS role_permissions_permission_id_idx
  ON role_permissions (permission_id);

CREATE OR REPLACE FUNCTION set_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS roles_set_updated_at ON roles;

CREATE TRIGGER roles_set_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION set_roles_updated_at();

CREATE OR REPLACE FUNCTION set_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS permissions_set_updated_at ON permissions;

CREATE TRIGGER permissions_set_updated_at
BEFORE UPDATE ON permissions
FOR EACH ROW
EXECUTE FUNCTION set_permissions_updated_at();

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE roles IS
  'Backend-owned AIM role definitions. Backend authorization remains final authority.';

COMMENT ON COLUMN roles.key IS
  'Stable shared role key. Must not be treated as authorization authority by clients.';

COMMENT ON COLUMN roles.is_system IS
  'Marks protected system roles that require backend safeguards for unsafe mutation or deletion.';

COMMENT ON TABLE permissions IS
  'Backend-owned AIM permission definitions enforced by backend guards and services.';

COMMENT ON COLUMN permissions.key IS
  'Stable shared permission key. Backend must enforce the full permission key.';

COMMENT ON COLUMN permissions.scope IS
  'Permission grouping value for backend organization and approved UX display only.';

COMMENT ON TABLE role_permissions IS
  'Backend-owned mapping between roles and permissions. Clients must not mutate mappings directly.';
