-- Phase 3 — P3-021
-- Create objectives table — learning objectives as first-class content records.
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for objective keys, status, and skill links.
-- - Clients must not directly write objective records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - Status transitions are backend-owned and follow the Phase 3 content status lifecycle.
-- - Objectives must not store learner progress, mastery, placement, retention, or recommendation results.
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
--
-- Dependencies:
-- P3-012 (objective contracts)

CREATE TABLE IF NOT EXISTS objectives (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Optional stable machine-readable key for curriculum tooling
  -- Must be unique when provided; recommended dot-delimited format
  key         TEXT        UNIQUE,

  -- Human-readable objective title — required
  title       TEXT        NOT NULL,

  -- Optional detail text for admin/editorial context
  description TEXT,

  -- Backend-owned content lifecycle status
  -- Values: draft | in_review | approved | published | archived
  status      TEXT        NOT NULL DEFAULT 'draft',

  -- Audit timestamps — set and updated by backend only
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Status constraint aligned with Phase 3 content status lifecycle (P3-007)
  CONSTRAINT objectives_status_check
    CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),

  -- Title must be non-empty
  CONSTRAINT objectives_title_nonempty_check
    CHECK (char_length(trim(title)) > 0)
);

-- Index for status and key lookups
CREATE INDEX IF NOT EXISTS objectives_status_idx
  ON objectives (status);

CREATE INDEX IF NOT EXISTS objectives_key_idx
  ON objectives (key)
  WHERE key IS NOT NULL;

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_objectives_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS objectives_set_updated_at ON objectives;

CREATE TRIGGER objectives_set_updated_at
BEFORE UPDATE ON objectives
FOR EACH ROW
EXECUTE FUNCTION set_objectives_updated_at();

-- Objective → Skill link table
-- Links objectives to one or more skills for coverage tracking.
-- This is not a learner progress or mastery record.
CREATE TABLE IF NOT EXISTS objective_skills (
  objective_id  UUID        NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  skill_id      UUID        NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (objective_id, skill_id)
);

CREATE INDEX IF NOT EXISTS objective_skills_skill_id_idx
  ON objective_skills (skill_id);

COMMENT ON TABLE objectives IS
  'Learning objectives as first-class curriculum content records. '
  'Backend is the source of truth for status, key, and skill links. '
  'Do not store learner mastery, progress, placement, session, or AIM runtime data here.';

COMMENT ON COLUMN objectives.key IS
  'Optional stable machine-readable objective key. '
  'Recommended format: objective.domain.topic.action (e.g. objective.grammar.past_simple.recognize_forms). '
  'Unique when provided. Changing this key requires an explicit migration.';

COMMENT ON COLUMN objectives.status IS
  'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived.';

COMMENT ON TABLE objective_skills IS
  'Mapping between objectives and related skills. '
  'Used for content coverage tracking and curriculum planning only. '
  'Must not be used for learner mastery, placement, or recommendation pipelines.';
