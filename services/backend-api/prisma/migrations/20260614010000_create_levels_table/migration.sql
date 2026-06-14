-- Phase 3 — P3-018
-- Create levels table — ordered learner levels within a course.
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for level status, ordering, and metadata.
-- - Clients must not directly write level records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - Status transitions are backend-owned and follow the Phase 3 content status lifecycle.
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
--
-- Dependencies:
-- P3-017 (courses table migration)

CREATE TABLE IF NOT EXISTS levels (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent course reference
  course_id   UUID        NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,

  -- Human-readable and optional stable identifiers
  title       TEXT        NOT NULL,
  code        TEXT,
  slug        TEXT,
  description TEXT,

  -- Display ordering within the parent course
  sort_order  INTEGER     NOT NULL DEFAULT 0,

  -- Backend-owned content lifecycle status
  -- Values: draft | in_review | approved | published | archived
  status      TEXT        NOT NULL DEFAULT 'draft',

  -- Audit timestamps — set and updated by backend only
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Status constraint aligned with Phase 3 content status lifecycle (P3-007)
  CONSTRAINT levels_status_check
    CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),

  -- Sort order must be non-negative
  CONSTRAINT levels_sort_order_check
    CHECK (sort_order >= 0),

  -- Slug unique per course when provided
  CONSTRAINT levels_slug_course_unique
    UNIQUE (course_id, slug)
);

-- Index for parent course queries
CREATE INDEX IF NOT EXISTS levels_course_id_idx
  ON levels (course_id);

CREATE INDEX IF NOT EXISTS levels_status_idx
  ON levels (status);

CREATE INDEX IF NOT EXISTS levels_course_sort_order_idx
  ON levels (course_id, sort_order);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS levels_set_updated_at ON levels;

CREATE TRIGGER levels_set_updated_at
BEFORE UPDATE ON levels
FOR EACH ROW
EXECUTE FUNCTION set_levels_updated_at();

COMMENT ON TABLE levels IS
  'Ordered learner levels within a course. Backend is the source of truth for status, ordering, and metadata. '
  'Do not store learner progress, placement, mastery, session, or AIM runtime data here.';

COMMENT ON COLUMN levels.course_id IS
  'Parent course reference. Cascade delete is restricted — levels must be removed explicitly.';

COMMENT ON COLUMN levels.code IS
  'Optional short code for the level (e.g. A1, B2). Editorial metadata only; not a mastery or placement signal.';

COMMENT ON COLUMN levels.status IS
  'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived.';

COMMENT ON COLUMN levels.sort_order IS
  'Display ordering within the parent course. Backend-owned.';
