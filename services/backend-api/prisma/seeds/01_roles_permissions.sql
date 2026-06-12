-- Phase 2 — P2-019
-- Seed data for initial roles and permissions.
--
-- Scope:
-- Auth, Users, Roles only.
--
-- Security rules:
-- - Role and permission keys must match the constraints defined in the P2-016 migration.
-- - Backend remains final authority for role membership and permission enforcement.
-- - Clients must not treat returned role or permission values as authorization authority.
-- - No secrets, service-role keys, database credentials, or privileged backend config are stored here.
-- - This seed must be executed only by backend-controlled tooling.
--
-- Usage:
-- Run after P2-016 migration (roles, permissions, role_permissions tables).
-- Safe to run multiple times — all inserts use ON CONFLICT DO NOTHING.

-- -----------------------------------------------------------------------
-- Roles
-- -----------------------------------------------------------------------

INSERT INTO roles (id, key, name, description, is_system)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'student',
    'Student',
    'Standard authenticated learner. Access limited to own profile and learning resources.',
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'admin',
    'Admin',
    'Platform administrator. Access to user management, role assignment, and admin dashboard.',
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'super_admin',
    'Super Admin',
    'Elevated administrator with full administrative access including role and permission management.',
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'reviewer',
    'Reviewer',
    'Content or quality reviewer. Read-only access to user profiles and platform data.',
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'support',
    'Support',
    'Support agent. Read access to user records and admin user list for issue resolution.',
    true
  )
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------
-- Permissions
-- -----------------------------------------------------------------------

INSERT INTO permissions (id, key, scope, description)
VALUES
  (
    'b2000000-0000-0000-0000-000000000001',
    'profiles.read.own',
    'profiles',
    'Read own student or admin profile.'
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    'profiles.update.own',
    'profiles',
    'Update own student or admin profile.'
  ),
  (
    'b2000000-0000-0000-0000-000000000003',
    'profiles.read.any',
    'profiles',
    'Read any user profile. Restricted to privileged roles.'
  ),
  (
    'b2000000-0000-0000-0000-000000000004',
    'profiles.update.any',
    'profiles',
    'Update any user profile. Restricted to super_admin only.'
  ),
  (
    'b2000000-0000-0000-0000-000000000005',
    'users.read',
    'users',
    'Read internal user records.'
  ),
  (
    'b2000000-0000-0000-0000-000000000006',
    'users.manage',
    'users',
    'Manage internal user records including status changes.'
  ),
  (
    'b2000000-0000-0000-0000-000000000007',
    'roles.read',
    'roles',
    'Read role definitions.'
  ),
  (
    'b2000000-0000-0000-0000-000000000008',
    'roles.manage',
    'roles',
    'Manage role definitions. Restricted to super_admin only.'
  ),
  (
    'b2000000-0000-0000-0000-000000000009',
    'permissions.read',
    'permissions',
    'Read permission definitions.'
  ),
  (
    'b2000000-0000-0000-0000-000000000010',
    'permissions.manage',
    'permissions',
    'Manage permission definitions. Restricted to super_admin only.'
  ),
  (
    'b2000000-0000-0000-0000-000000000011',
    'admin.users.read',
    'admin.users',
    'Admin — read user list and user detail.'
  ),
  (
    'b2000000-0000-0000-0000-000000000012',
    'admin.users.manage',
    'admin.users',
    'Admin — manage users including role assignment and status changes.'
  ),
  (
    'b2000000-0000-0000-0000-000000000013',
    'auth.audit.read',
    'auth.audit',
    'Read auth audit log. Restricted to super_admin only.'
  )
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------
-- Role — Permission Mapping
-- -----------------------------------------------------------------------

-- student: own profile read/write only
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001'), -- profiles.read.own
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002')  -- profiles.update.own
ON CONFLICT DO NOTHING;

-- admin: user management, role read, own profile, any profile read, admin user ops
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001'), -- profiles.read.own
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002'), -- profiles.update.own
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000003'), -- profiles.read.any
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000005'), -- users.read
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000006'), -- users.manage
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000007'), -- roles.read
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000009'), -- permissions.read
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000011'), -- admin.users.read
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000012')  -- admin.users.manage
ON CONFLICT DO NOTHING;

-- super_admin: all permissions
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000001'), -- profiles.read.own
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000002'), -- profiles.update.own
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003'), -- profiles.read.any
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000004'), -- profiles.update.any
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000005'), -- users.read
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000006'), -- users.manage
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000007'), -- roles.read
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000008'), -- roles.manage
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000009'), -- permissions.read
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000010'), -- permissions.manage
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000011'), -- admin.users.read
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000012'), -- admin.users.manage
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000013')  -- auth.audit.read
ON CONFLICT DO NOTHING;

-- reviewer: read-only access to profiles and users
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000001'), -- profiles.read.own
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000003'), -- profiles.read.any
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000005')  -- users.read
ON CONFLICT DO NOTHING;

-- support: read access to users and admin user list
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000001'), -- profiles.read.own
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000003'), -- profiles.read.any
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005'), -- users.read
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000011')  -- admin.users.read
ON CONFLICT DO NOTHING;
