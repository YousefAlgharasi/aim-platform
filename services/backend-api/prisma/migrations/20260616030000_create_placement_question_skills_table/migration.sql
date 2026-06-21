-- Phase 4 — P4-020
-- Create placement_question_skills table — many-to-many mapping between
-- placement questions and skills.
--
-- Purpose:
-- Enables the backend scoring service to produce skill maps and weakness maps
-- from placement attempt answers. Each placement question is linked to one or
-- more skills; the primary skill link drives scoring attribution.
--
-- Scope:
-- Placement Test system only.
--
-- Security rules:
-- - Backend is the sole authority for placement question-to-skill mappings.
-- - Clients must not directly write placement_question_skills records.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - CRITICAL: A placement question must have exactly one row with is_primary = true
--   before it can be included in a live placement test. Enforced at the backend
--   placement question publish/activate endpoint — not by this migration alone.
-- - Skills are referenced by skill_id (stable UUID from the skills table), never by display label.
-- - Do not store AIM Engine runtime data, lesson delivery, practice attempts,
--   session state, progress dashboard, AI Teacher, or Student Web App data here.
-- - correct_answer, scoring logic, and skill map computation remain backend-only.
--   Flutter/client must never infer skill scores or weakness maps from this table.
--
-- Dependencies:
-- P3-020 (skills table migration) — defines skills table this table references
-- P4-019 (placement_questions migration) — defines placement_questions table this table references

CREATE TABLE IF NOT EXISTS placement_question_skills (
  -- Owning placement question — when a question is removed its skill links are removed
  placement_question_id  UUID      NOT NULL
    REFERENCES placement_questions (id) ON DELETE CASCADE,

  -- Linked skill — a skill referenced by a placement question cannot be hard-deleted
  skill_id               UUID      NOT NULL
    REFERENCES skills (id) ON DELETE RESTRICT,

  -- Whether this is the primary skill assessed by this placement question.
  -- At most one row per question may have is_primary = true (enforced by partial unique index below).
  -- Exactly one is_primary = true row is required before a question is activated
  -- in a live placement test — enforced at the backend activation endpoint.
  is_primary             BOOLEAN   NOT NULL DEFAULT false,

  -- Audit timestamp — set by backend only
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Composite primary key: a question can be linked to each skill at most once
  PRIMARY KEY (placement_question_id, skill_id)
);

-- Index: reverse lookup — which placement questions assess a given skill
-- Used by the backend scoring service when building skill maps and weakness maps
CREATE INDEX IF NOT EXISTS placement_question_skills_skill_id_idx
  ON placement_question_skills (skill_id);

-- Index: forward lookup — all skills linked to a given placement question
CREATE INDEX IF NOT EXISTS placement_question_skills_question_id_idx
  ON placement_question_skills (placement_question_id);

-- Partial unique index: at most one primary skill per placement question
-- A second row with is_primary = true for the same question will be rejected.
CREATE UNIQUE INDEX IF NOT EXISTS placement_question_skills_one_primary_idx
  ON placement_question_skills (placement_question_id)
  WHERE is_primary = true;

COMMENT ON TABLE placement_question_skills IS
  'Maps placement questions to one or more skills they assess. '
  'The primary skill link (is_primary = true) drives skill map and weakness map computation '
  'during backend placement scoring. '
  'CRITICAL: A placement question must have exactly one row with is_primary = true '
  'before it can be activated in a live placement test. '
  'Enforced by the backend activation endpoint — not by this migration alone. '
  'Cascade delete on question removal; RESTRICT on skill removal to prevent orphaned links. '
  'Flutter/client must never use this table to compute scores, skill maps, or weakness maps — '
  'all scoring is backend-only.';

COMMENT ON COLUMN placement_question_skills.placement_question_id IS
  'Foreign key to placement_questions. Cascade-deletes when the question is removed.';

COMMENT ON COLUMN placement_question_skills.skill_id IS
  'Foreign key to skills (P3-020). RESTRICT-deletes to prevent orphaned skill links.';

COMMENT ON COLUMN placement_question_skills.is_primary IS
  'True if this skill is the primary skill assessed by the question. '
  'At most one row per question may be true (enforced by partial unique index). '
  'Exactly one true row is required before the question is activated — backend-enforced.';
