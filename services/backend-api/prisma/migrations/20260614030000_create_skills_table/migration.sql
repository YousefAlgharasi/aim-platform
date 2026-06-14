-- Phase 3 — P3-020
-- Create skills table — stable skill taxonomy used by lessons and questions.
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for skill keys, domain, status, and hierarchy.
-- - Clients must not directly write skill records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - Status transitions are backend-owned and follow the Phase 3 content status lifecycle.
-- - Skill keys must be stable, machine-readable, and lowercase dot-delimited identifiers.
--   Display labels must not be used as primary identifiers.
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
--
-- Dependencies:
-- P3-011 (skill/objective contracts)

CREATE TABLE IF NOT EXISTS skills (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stable machine-readable identifier (e.g. grammar.past_simple.forms)
  -- Must be lowercase, dot-delimited, and unique.
  -- Display labels must not be used here.
  key             TEXT        NOT NULL UNIQUE,

  -- Human-readable display label — not a primary identifier
  title           TEXT        NOT NULL,
  description     TEXT,

  -- Skill family / domain grouping
  -- Values: grammar | vocabulary | reading | listening | speaking |
  --         writing | pronunciation | functional_language
  domain          TEXT        NOT NULL,

  -- Optional self-referential parent for skill hierarchy/taxonomy
  parent_skill_id UUID        REFERENCES skills(id) ON DELETE RESTRICT,

  -- Backend-owned content lifecycle status
  -- Values: draft | in_review | approved | published | archived
  status          TEXT        NOT NULL DEFAULT 'draft',

  -- Audit timestamps — set and updated by backend only
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Domain constraint aligned with Phase 3 skill contract (P3-011)
  CONSTRAINT skills_domain_check
    CHECK (domain IN (
      'grammar', 'vocabulary', 'reading', 'listening',
      'speaking', 'writing', 'pronunciation', 'functional_language'
    )),

  -- Status constraint aligned with Phase 3 content status lifecycle (P3-007)
  CONSTRAINT skills_status_check
    CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),

  -- Skill key must be non-empty and lowercase dot-delimited
  CONSTRAINT skills_key_format_check
    CHECK (key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$')
);

-- Index for key lookups (most frequent query pattern)
CREATE INDEX IF NOT EXISTS skills_key_idx
  ON skills (key);

CREATE INDEX IF NOT EXISTS skills_domain_idx
  ON skills (domain);

CREATE INDEX IF NOT EXISTS skills_status_idx
  ON skills (status);

CREATE INDEX IF NOT EXISTS skills_parent_skill_id_idx
  ON skills (parent_skill_id)
  WHERE parent_skill_id IS NOT NULL;

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS skills_set_updated_at ON skills;

CREATE TRIGGER skills_set_updated_at
BEFORE UPDATE ON skills
FOR EACH ROW
EXECUTE FUNCTION set_skills_updated_at();

COMMENT ON TABLE skills IS
  'Stable skill taxonomy used by lessons and questions. '
  'Backend is the source of truth for skill keys, domain, and status. '
  'Do not store learner mastery, placement, session, progress, or AIM runtime data here.';

COMMENT ON COLUMN skills.key IS
  'Stable machine-readable identifier. Must be lowercase dot-delimited (e.g. grammar.past_simple.forms). '
  'Display labels must not be used as primary identifiers. Changing this key requires an explicit migration.';

COMMENT ON COLUMN skills.domain IS
  'Skill family grouping. Editorial metadata only — not a mastery or level signal.';

COMMENT ON COLUMN skills.parent_skill_id IS
  'Optional parent skill for taxonomy hierarchy. Cascade delete is restricted.';

COMMENT ON COLUMN skills.status IS
  'Backend-owned content lifecycle status. Allowed values: draft, in_review, approved, published, archived.';
