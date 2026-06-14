-- Phase 3 — P3-017
-- Create courses table — top-level curriculum container.
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for course status, ordering, and metadata.
-- - Clients must not directly write course records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - Status transitions are backend-owned and follow the Phase 3 content status lifecycle.
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
--
-- Dependencies:
-- P3-005 (curriculum data model map)
-- P3-009 (course/level/chapter contracts)

CREATE TABLE IF NOT EXISTS courses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Human-readable identifiers
  title       TEXT        NOT NULL,
  slug        TEXT        UNIQUE,
  description TEXT,

  -- Display ordering within the curriculum
  sort_order  INTEGER     NOT NULL DEFAULT 0,

  -- Backend-owned content lifecycle status
  -- Values: draft | in_review | approved | published | archived
  status      TEXT        NOT NULL DEFAULT 'draft',

  -- Audit timestamps — set and updated by backend only
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Status constraint aligned with Phase 3 content status lifecycle (P3-007)
  CONSTRAINT courses_status_check
    CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),

  -- Sort order must be non-negative
  CONSTRAINT courses_sort_order_check
    CHECK (sort_order >= 0)
);

-- Index for common admin list queries
CREATE INDEX IF NOT EXISTS courses_status_idx
  ON courses (status);

CREATE INDEX IF NOT EXISTS courses_sort_order_idx
  ON courses (sort_order);

CREATE INDEX IF NOT EXISTS courses_slug_idx
  ON courses (slug)
  WHERE slug IS NOT NULL;

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS courses_set_updated_at ON courses;

CREATE TRIGGER courses_set_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION set_courses_updated_at();

COMMENT ON TABLE courses IS
  'Top-level curriculum courses. Backend is the source of truth for status, ordering, and metadata. '
  'Do not store learner progress, placement, mastery, session, or AIM runtime data here.';

COMMENT ON COLUMN courses.status IS
  'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived.';

COMMENT ON COLUMN courses.slug IS
  'Optional unique URL-safe identifier. Backend-generated or backend-validated only.';

COMMENT ON COLUMN courses.sort_order IS
  'Display ordering within the curriculum course list. Backend-owned.';
