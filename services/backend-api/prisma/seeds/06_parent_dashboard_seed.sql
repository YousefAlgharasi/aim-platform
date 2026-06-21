-- P12-015: Add Parent Dashboard Seed Fixtures
-- Branch: phase12/P12-015-parent-seed-fixtures
-- Dependency: P12-014 (Parent Dashboard DB Constraints)
-- Scope:
-- Safe development fixtures for parent_child_links, parent_invitations, and
-- parent_consents only — supports local backend/UI testing for the Phase 12
-- Parent Dashboard.
--
-- Security rules:
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys
--   are stored here.
-- - parent_id / child_id values below are placeholder dev UUIDs only. They do not reference
--   real auth.users rows — replace with real user ids from your local Supabase Auth instance
--   before exercising the parent endpoints end-to-end.
-- - This seed must be executed only by backend-controlled tooling (e.g. prisma db seed or
--   a psql pipeline) against a local/dev database, never production.
-- - Backend remains the final authority for child access, consent, progress, assessment
--   results, and AIM outputs — this seed only exercises link/invitation/consent state, never
--   progress, scoring, or AIM data.
--
-- Usage:
-- Run after the parent_child_links (P12-009), parent_invitations (P12-010), and
-- parent_consents (P12-011) migrations, and after the constraints migration (P12-014),
-- are applied. Safe to run multiple times — all inserts use ON CONFLICT DO NOTHING.
--
-- Fixture scenarios covered:
-- 1. An active parent-child link with full "progress_view" + "assessment_view" consent
--    (parent-dev-1 / child-dev-1) — the common, fully-authorized case.
-- 2. An active link where consent has since been revoked (parent-dev-1 / child-dev-2) —
--    exercises the "linked but not consented" guard path.
-- 3. A pending (not yet accepted) link with no consent rows at all (parent-dev-2 / child-dev-3)
--    — exercises the "not yet linked" guard path.
-- 4. A revoked link that was previously active (parent-dev-2 / child-dev-4) — exercises the
--    "link revoked" guard path.
-- 5. A pending invitation by email (not yet accepted) — exercises the invitation-acceptance flow.
-- 6. An expired invitation — exercises the expired-invitation error path.
-- 7. A cancelled invitation — exercises the revoked-invitation display path.

-- -----------------------------------------------------------------------
-- 1. Parent Child Links
-- -----------------------------------------------------------------------

INSERT INTO parent_child_links (
  id,
  parent_id,
  child_id,
  relationship_type,
  status,
  linked_at,
  revoked_at,
  created_at,
  updated_at
)
VALUES
  -- Active link, parent-dev-1 / child-dev-1 — fully consented case
  (
    'c1200000-0000-0000-0000-000000000001',
    'a1200000-0000-0000-0000-00000000d001', -- parent-dev-1
    'a1200000-0000-0000-0000-00000000c001', -- child-dev-1
    'parent',
    'active',
    now() - interval '30 days',
    NULL,
    now() - interval '30 days',
    now() - interval '30 days'
  ),
  -- Active link, parent-dev-1 / child-dev-2 — consent later revoked
  (
    'c1200000-0000-0000-0000-000000000002',
    'a1200000-0000-0000-0000-00000000d001', -- parent-dev-1
    'a1200000-0000-0000-0000-00000000c002', -- child-dev-2
    'parent',
    'active',
    now() - interval '20 days',
    NULL,
    now() - interval '20 days',
    now() - interval '20 days'
  ),
  -- Pending link, parent-dev-2 / child-dev-3 — not yet linked
  (
    'c1200000-0000-0000-0000-000000000003',
    'a1200000-0000-0000-0000-00000000d002', -- parent-dev-2
    'a1200000-0000-0000-0000-00000000c003', -- child-dev-3
    'guardian',
    'pending',
    NULL,
    NULL,
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  -- Revoked link, parent-dev-2 / child-dev-4 — was active, now revoked
  (
    'c1200000-0000-0000-0000-000000000004',
    'a1200000-0000-0000-0000-00000000d002', -- parent-dev-2
    'a1200000-0000-0000-0000-00000000c004', -- child-dev-4
    'parent',
    'revoked',
    now() - interval '60 days',
    now() - interval '5 days',
    now() - interval '60 days',
    now() - interval '5 days'
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 2. Parent Consents
-- -----------------------------------------------------------------------

INSERT INTO parent_consents (
  id,
  parent_child_link_id,
  consent_type,
  status,
  granted_at,
  revoked_at,
  granted_by,
  created_at,
  updated_at
)
VALUES
  -- Link 1 (active, fully consented): progress_view granted
  (
    'c1300000-0000-0000-0000-000000000001',
    'c1200000-0000-0000-0000-000000000001',
    'progress_view',
    'granted',
    now() - interval '30 days',
    NULL,
    'a1200000-0000-0000-0000-00000000c001', -- granted by child-dev-1
    now() - interval '30 days',
    now() - interval '30 days'
  ),
  -- Link 1: assessment_view granted
  (
    'c1300000-0000-0000-0000-000000000002',
    'c1200000-0000-0000-0000-000000000001',
    'assessment_view',
    'granted',
    now() - interval '30 days',
    NULL,
    'a1200000-0000-0000-0000-00000000c001',
    now() - interval '30 days',
    now() - interval '30 days'
  ),
  -- Link 2 (active, consent revoked): progress_view revoked
  (
    'c1300000-0000-0000-0000-000000000003',
    'c1200000-0000-0000-0000-000000000002',
    'progress_view',
    'revoked',
    now() - interval '20 days',
    now() - interval '3 days',
    'a1200000-0000-0000-0000-00000000c002', -- granted by child-dev-2
    now() - interval '20 days',
    now() - interval '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 3. Parent Invitations
-- -----------------------------------------------------------------------

INSERT INTO parent_invitations (
  id,
  parent_id,
  child_email,
  child_id,
  invitation_code,
  relationship_type,
  status,
  expires_at,
  accepted_at,
  created_at,
  updated_at
)
VALUES
  -- Pending invitation by email, not yet accepted
  (
    'c1400000-0000-0000-0000-000000000001',
    'a1200000-0000-0000-0000-00000000d003', -- parent-dev-3
    'child-dev-pending@example.test',
    NULL,
    'devseed-pending-0001',
    'parent',
    'pending',
    now() + interval '5 days',
    NULL,
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  -- Expired invitation — exercises the expired-invitation error path
  (
    'c1400000-0000-0000-0000-000000000002',
    'a1200000-0000-0000-0000-00000000d003', -- parent-dev-3
    'child-dev-expired@example.test',
    NULL,
    'devseed-expired-0001',
    'parent',
    'expired',
    now() - interval '1 days',
    NULL,
    now() - interval '10 days',
    now() - interval '1 days'
  ),
  -- Cancelled invitation — parent revoked it before it was accepted
  (
    'c1400000-0000-0000-0000-000000000003',
    'a1200000-0000-0000-0000-00000000d003', -- parent-dev-3
    'child-dev-cancelled@example.test',
    NULL,
    'devseed-cancelled-0001',
    'guardian',
    'cancelled',
    now() + interval '6 days',
    NULL,
    now() - interval '4 days',
    now() - interval '1 days'
  )
ON CONFLICT (id) DO NOTHING;
