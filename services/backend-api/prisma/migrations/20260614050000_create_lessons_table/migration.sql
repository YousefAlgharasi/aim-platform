-- Phase 3 — P3-022
-- Create lessons table — content lessons linked to curriculum hierarchy.
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for lesson status, ordering, and hierarchy reference.
-- - Clients must not directly write lesson records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - Status transitions are backend-owned and follow the Phase 3 content status lifecycle.
-- - CRITICAL: A lesson cannot be published without at least one linked published skill.
--   This rule is enforced at the backend publish endpoint (see P3-006 lesson-skill-linking-rules).
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
--
-- Dependencies:
-- P3-019 (chapters table migration)
-- P3-010 (lesson contract)
-- P3-015 (content status contract)

CREATE TABLE IF NOT EXISTS lessons (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent chapter reference — set on creation, never changed
  chapter_id  UUID        NOT NULL REFERENCES chapters(id) ON DELETE RESTRICT,

  -- Lesson content fields
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL,

  -- Display ordering within the parent chapter
  -- Must be a positive integer, unique within the chapter (enforced by backend logic)
  sort_order  INTEGER     NOT NULL DEFAULT 0,

  -- Backend-owned content lifecycle status
  -- Values: draft | in_review | approved | published | archived
  -- CRITICAL: status = 'published' requires at least one linked published skill (enforced by backend)
  status      TEXT        NOT NULL DEFAULT 'draft',

  -- Audit timestamps — set and updated by backend only
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Status constraint aligned with Phase 3 content status lifecycle (P3-007)
  CONSTRAINT lessons_status_check
    CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),

  -- Title and description must be non-empty
  CONSTRAINT lessons_title_nonempty_check
    CHECK (char_length(trim(title)) > 0),

  CONSTRAINT lessons_description_nonempty_check
    CHECK (char_length(trim(description)) > 0),

  -- Sort order must be non-negative
  CONSTRAINT lessons_sort_order_check
    CHECK (sort_order >= 0)
);

-- Index for parent chapter queries
CREATE INDEX IF NOT EXISTS lessons_chapter_id_idx
  ON lessons (chapter_id);

CREATE INDEX IF NOT EXISTS lessons_status_idx
  ON lessons (status);

CREATE INDEX IF NOT EXISTS lessons_chapter_sort_order_idx
  ON lessons (chapter_id, sort_order);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lessons_set_updated_at ON lessons;

CREATE TRIGGER lessons_set_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION set_lessons_updated_at();

COMMENT ON TABLE lessons IS
  'Curriculum lessons linked to chapters. '
  'Backend is the source of truth for status, ordering, and hierarchy references. '
  'CRITICAL: A lesson cannot be published without at least one linked published skill — '
  'enforced at the backend publish endpoint (P3-006). '
  'Do not store learner progress, delivery state, mastery, session, or AIM runtime data here.';

COMMENT ON COLUMN lessons.chapter_id IS
  'Parent chapter reference. Set on creation only — cannot be changed. '
  'Cascade delete is restricted; lessons must be archived or removed explicitly.';

COMMENT ON COLUMN lessons.status IS
  'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived. '
  'Publishing requires at least one linked published skill (backend enforced).';

COMMENT ON COLUMN lessons.sort_order IS
  'Display ordering within the parent chapter. '
  'Backend ensures uniqueness per chapter. Clients must not rely on local ordering.';
