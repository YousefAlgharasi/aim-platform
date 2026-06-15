-- Phase 3 — P3-027
-- Create question_skills table — many-to-many mapping between question_bank
-- items and the skills they assess or develop, with an `is_primary` flag.
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for question-to-skill mappings.
-- - Clients must not directly write question_skills records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - CRITICAL: A question cannot be published without exactly one row in this
--   table for that question with is_primary = true, pointing to a published
--   skill (P3-014 Section 7.2, QUESTION_NO_PRIMARY_SKILL). Enforced at the
--   backend publish endpoint — not by this migration alone.
-- - Skills are referenced by skill_id (stable UUID), never by display label.
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
--
-- Dependencies:
-- P3-026 (question_bank table migration)
-- P3-020 (skills table migration)

CREATE TABLE IF NOT EXISTS question_skills (
  -- Owning question — when a question is removed, its skill links are removed
  question_id  UUID        NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,

  -- Linked skill — a skill referenced by a question cannot be hard-deleted
  skill_id     UUID        NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,

  -- Whether this is the primary skill assessed/developed by the question.
  -- At most one row per question may have is_primary = true (enforced below).
  -- Exactly one is required before the question can be published — enforced
  -- at the backend publish endpoint (P3-014 Section 7.2).
  is_primary   BOOLEAN     NOT NULL DEFAULT false,

  -- Audit timestamp — set by backend only
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (question_id, skill_id)
);

-- Index for reverse lookups (which questions assess a given skill)
CREATE INDEX IF NOT EXISTS question_skills_skill_id_idx
  ON question_skills (skill_id);

-- At most one primary skill per question (P3-014 Section 7.2: "Exactly one
-- mapping per question may have is_primary = true").
CREATE UNIQUE INDEX IF NOT EXISTS question_skills_one_primary_idx
  ON question_skills (question_id)
  WHERE is_primary = true;

COMMENT ON TABLE question_skills IS
  'Maps question_bank items to one or more skills they assess or develop. '
  'CRITICAL: A question cannot be published without exactly one row here with '
  'is_primary = true, pointing to a published skill (P3-014 Section 7.2). '
  'Enforced by the backend publish endpoint. '
  'Cascade delete on question removal; RESTRICT on skill removal to prevent orphaned links.';

COMMENT ON COLUMN question_skills.question_id IS
  'Parent question_bank reference. Cascade-deleted when the question is deleted.';

COMMENT ON COLUMN question_skills.skill_id IS
  'Linked skill reference. RESTRICT prevents deleting a skill that is still linked to questions.';

COMMENT ON COLUMN question_skills.is_primary IS
  'Whether this is the primary skill for the question. At most one row per '
  'question may be true (enforced by question_skills_one_primary_idx). '
  'Exactly one primary mapping to a published skill is required before publish.';
