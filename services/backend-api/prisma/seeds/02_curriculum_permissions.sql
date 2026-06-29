-- Phase 3 — P3-046
-- Curriculum permissions seed.
--
-- Scope:
-- Curriculum & Content System only.
-- Inserts curriculum permission keys and role mappings aligned with P3-008.
--
-- Security rules:
-- - No secrets, service-role keys, database credentials, or privileged config are stored here.
-- - Backend remains final authority for permission enforcement.
-- - Clients must not treat returned permission values as authorization authority.
-- - No onboarding, placement, session, AIM runtime, or learner delivery permissions are defined here.
--
-- Prerequisites:
-- P2-016 migration (roles, permissions, role_permissions tables)
-- P2-019 seed (initial roles: admin a1000000-...-002, super_admin ...-003, reviewer ...-004)
--
-- Usage:
-- Safe to run multiple times — all inserts use ON CONFLICT DO NOTHING.

-- -----------------------------------------------------------------------
-- Curriculum Permissions
-- -----------------------------------------------------------------------

INSERT INTO permissions (id, key, scope, description)
VALUES
  (
    'c3000000-0000-0000-0000-000000000001',
    'curriculum.content.read.published',
    'curriculum',
    'Read published curriculum content.'
  ),
  (
    'c3000000-0000-0000-0000-000000000002',
    'curriculum.content.read.draft',
    'curriculum',
    'Read draft curriculum content. Restricted to admin and reviewer roles.'
  ),
  (
    'c3000000-0000-0000-0000-000000000003',
    'curriculum.content.read.archived',
    'curriculum',
    'Read archived curriculum content. Restricted to admin roles.'
  ),
  (
    'c3000000-0000-0000-0000-000000000004',
    'curriculum.content.create',
    'curriculum',
    'Create new curriculum content items. New items are always initialized as draft by the backend.'
  ),
  (
    'c3000000-0000-0000-0000-000000000005',
    'curriculum.content.update',
    'curriculum',
    'Update draft curriculum content. Published and archived content is immutable.'
  ),
  (
    'c3000000-0000-0000-0000-000000000006',
    'curriculum.content.publish',
    'curriculum',
    'Publish draft curriculum content. Backend enforces all publish requirements including lesson-skill linking.'
  ),
  (
    'c3000000-0000-0000-0000-000000000007',
    'curriculum.content.archive',
    'curriculum',
    'Archive draft or published curriculum content. Archived content is retained for audit purposes.'
  ),
  (
    'c3000000-0000-0000-0000-000000000008',
    'curriculum.content.restore',
    'curriculum',
    'Restore archived curriculum content to draft. Restricted to super_admin only. Must be audit-logged.'
  ),
  (
    'c3000000-0000-0000-0000-000000000009',
    'curriculum.skill_links.manage',
    'curriculum',
    'Manage lesson-skill and question-skill mappings.'
  ),
  (
    'c3000000-0000-0000-0000-000000000010',
    'curriculum.audit.read',
    'curriculum',
    'Read curriculum audit log. Restricted to admin roles.'
  )
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------
-- Role — Curriculum Permission Mappings
-- -----------------------------------------------------------------------

-- super_admin: full curriculum access including restore and audit
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  ('a1000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003'),
  ('a1000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000005'),
  ('a1000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000006'),
  ('a1000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000007'),
  ('a1000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000008'),
  ('a1000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000009'),
  ('a1000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000010')
ON CONFLICT DO NOTHING;

-- admin: create, update, publish, archive, skill links, read all statuses, audit read
-- no restore (super_admin only per P3-008)
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  ('a1000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000003'),
  ('a1000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000005'),
  ('a1000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000006'),
  ('a1000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000007'),
  ('a1000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000009'),
  ('a1000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000010')
ON CONFLICT DO NOTHING;

-- reviewer: read published and draft only (read-only, no write/publish/archive/restore)
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  ('a1000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- student: read published content only (learner-facing course browsing)
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
