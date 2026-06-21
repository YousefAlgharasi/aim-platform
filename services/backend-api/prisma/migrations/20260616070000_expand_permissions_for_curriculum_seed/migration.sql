-- Expand permissions constraints to include Phase 3 curriculum permissions.
-- The P3 curriculum seed adds backend-owned curriculum permission keys; keep
-- the allow-list constraint explicit while accepting those approved values.

ALTER TABLE permissions
  DROP CONSTRAINT IF EXISTS permissions_scope_check;

ALTER TABLE permissions
  ADD CONSTRAINT permissions_scope_check
  CHECK (
    scope IN (
      'profiles',
      'users',
      'roles',
      'permissions',
      'admin.users',
      'auth.audit',
      'curriculum'
    )
  );

ALTER TABLE permissions
  DROP CONSTRAINT IF EXISTS permissions_key_check;

ALTER TABLE permissions
  ADD CONSTRAINT permissions_key_check
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
      'auth.audit.read',
      'curriculum.content.read.published',
      'curriculum.content.read.draft',
      'curriculum.content.read.archived',
      'curriculum.content.create',
      'curriculum.content.update',
      'curriculum.content.publish',
      'curriculum.content.archive',
      'curriculum.content.restore',
      'curriculum.skill_links.manage',
      'curriculum.audit.read'
    )
  );
