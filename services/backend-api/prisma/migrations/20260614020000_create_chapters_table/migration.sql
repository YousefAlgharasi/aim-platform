-- Phase 3 — P3-019
-- Create chapters table — ordered chapter groupings for lessons within a level.
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for chapter status, ordering, and metadata.
-- - Clients must not directly write chapter records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - Status transitions are backend-owned and follow the Phase 3 content status lifecycle.
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
--
-- Dependencies:
-- P3-018 (levels table migration)

CREATE TABLE IF NOT EXISTS chapters (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent level reference
  level_id    UUID        NOT NULL REFERENCES levels(id) ON DELETE RESTRICT,

  -- Human-readable and optional stable identifiers
  title       TEXT        NOT NULL,
  slug        TEXT,
  description TEXT,

  -- Display ordering within the parent level
  sort_order  INTEGER     NOT NULL DEFAULT 0,

  -- Backend-owned content lifecycle status
  -- Values: draft | in_review | approved | published | archived
  status      TEXT        NOT NULL DEFAULT 'draft',

  -- Audit timestamps — set and updated by backend only
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Status constraint aligned with Phase 3 content status lifecycle (P3-007)
  CONSTRAINT chapters_status_check
    CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),

  -- Sort order must be non-negative
  CONSTRAINT chapters_sort_order_check
    CHECK (sort_order >= 0),

  -- Slug unique per level when provided
  CONSTRAINT chapters_slug_level_unique
    UNIQUE (level_id, slug)
);

-- Index for parent level queries
CREATE INDEX IF NOT EXISTS chapters_level_id_idx
  ON chapters (level_id);

CREATE INDEX IF NOT EXISTS chapters_status_idx
  ON chapters (status);

CREATE INDEX IF NOT EXISTS chapters_level_sort_order_idx
  ON chapters (level_id, sort_order);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_chapters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chapters_set_updated_at ON chapters;

CREATE TRIGGER chapters_set_updated_at
BEFORE UPDATE ON chapters
FOR EACH ROW
EXECUTE FUNCTION set_chapters_updated_at();

COMMENT ON TABLE chapters IS
  'Ordered chapter groupings for lessons within a curriculum level. '
  'Backend is the source of truth for status, ordering, and metadata. '
  'Do not store learner progress, placement, mastery, session, or AIM runtime data here.';

COMMENT ON COLUMN chapters.level_id IS
  'Parent level reference. Cascade delete is restricted — chapters must be removed explicitly.';

COMMENT ON COLUMN chapters.status IS
  'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived.';

COMMENT ON COLUMN chapters.sort_order IS
  'Display ordering within the parent level. Backend-owned.';
