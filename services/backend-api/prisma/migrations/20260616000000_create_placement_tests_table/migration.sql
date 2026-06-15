-- Phase 4 — P4-017
-- Create placement_tests table — stores placement test definitions including
-- title, status (draft/published), estimated duration, and section count.
--
-- Scope:
-- Placement Test phase only.
--
-- Security rules:
-- - Backend is the sole authority for placement test status transitions.
-- - Only one placement test may have status = 'published' at a time;
--   enforced by the unique partial index below and by the backend publish
--   endpoint (P4-009 Section 2.2).
-- - total_sections is computed by the backend from the placement_sections
--   table — clients must never write this column directly.
-- - Clients (Flutter/web) must never receive or compute: status transitions,
--   scoring parameters, CEFR thresholds, section weights, or is_correct flags.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI
--   provider keys are stored in this migration.
-- - Do not implement AIM Engine runtime integration, AI Teacher, lesson
--   delivery, practice sessions, recommendations, progress dashboard, or
--   Phase 5+ tables here.
--
-- Dependencies:
-- P4-009 (placement-test-contracts.md — defines fields, status values, rules)

CREATE TABLE IF NOT EXISTS placement_tests (
  -- Primary key — set by backend only, never writable by clients
  id                UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Human-readable title for admin management
  -- Non-empty string; required at creation (P4-009 Section 5)
  title             TEXT        NOT NULL,

  -- Optional description shown to the student before they start
  description       TEXT,

  -- Lifecycle status — backend controlled only (P4-009 Section 2.2)
  -- 'draft'     : under construction, not visible to students
  -- 'published' : active and available to students
  -- 'archived'  : retired, read-only for admin audit
  status            TEXT        NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'archived')),

  -- Estimated completion time in minutes — set by admin at creation (P4-009 Section 5)
  -- Must be a positive integer
  estimated_minutes INTEGER     NOT NULL DEFAULT 20
                    CHECK (estimated_minutes > 0),

  -- Computed section count — updated by backend when sections are added/removed
  -- Clients must not write this column directly
  total_sections    INTEGER     NOT NULL DEFAULT 0
                    CHECK (total_sections >= 0),

  -- Version counter — incremented by backend on each publish transition
  version           INTEGER     NOT NULL DEFAULT 0
                    CHECK (version >= 0),

  -- Audit timestamps — set and managed by backend only
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at      TIMESTAMPTZ
);

-- Only one test may be published at a time.
-- Backend enforces this constraint at the publish endpoint AND at the DB level.
-- (P4-009 Section 2.2: "Only one placement test may have status = published at a time.")
CREATE UNIQUE INDEX IF NOT EXISTS placement_tests_one_published_idx
  ON placement_tests (status)
  WHERE status = 'published';

-- Index for admin list queries ordered by creation time
CREATE INDEX IF NOT EXISTS placement_tests_created_at_idx
  ON placement_tests (created_at DESC);

-- Index for status filtering (admin list by status, student active-test lookup)
CREATE INDEX IF NOT EXISTS placement_tests_status_idx
  ON placement_tests (status);

COMMENT ON TABLE placement_tests IS
  'Stores placement test definitions for the AIM Phase 4 placement flow. '
  'Only one test may have status = ''published'' at a time (enforced by '
  'placement_tests_one_published_idx and the backend publish endpoint). '
  'total_sections is computed by the backend — clients must not write it. '
  'Status transitions are backend-controlled only (P4-009 Section 2.2). '
  'Scope: Placement Test phase only. No AIM Engine runtime, no lesson delivery.';

COMMENT ON COLUMN placement_tests.id IS
  'Primary key UUID. Set by backend on creation; never writable by clients.';

COMMENT ON COLUMN placement_tests.title IS
  'Human-readable placement test title. Required, non-empty string (P4-009 Section 5).';

COMMENT ON COLUMN placement_tests.description IS
  'Optional short description shown to the student before starting the test.';

COMMENT ON COLUMN placement_tests.status IS
  'Lifecycle status: draft | published | archived. '
  'Backend-controlled only. Transitions: draft→published→archived, draft→archived. '
  'published→draft and archived→* are forbidden (P4-009 Section 2.2).';

COMMENT ON COLUMN placement_tests.estimated_minutes IS
  'Estimated test duration in minutes. Must be a positive integer. '
  'Set by admin at creation; readable by students via the active-test endpoint.';

COMMENT ON COLUMN placement_tests.total_sections IS
  'Count of sections linked to this test. Computed by the backend from '
  'placement_sections — clients must never write this column.';

COMMENT ON COLUMN placement_tests.version IS
  'Auto-incremented by the backend on each publish transition. '
  'Not exposed to students.';

COMMENT ON COLUMN placement_tests.published_at IS
  'Timestamp when the test was last transitioned to published status. '
  'Set by backend only; not exposed to students.';
