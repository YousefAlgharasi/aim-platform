-- Phase 3 - P3-027
-- Create question_skills mapping table.
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for question-skill mappings.
-- - Clients must not directly write question_skills records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - Skill links use the stable skills.id reference. Display labels must not be used as identifiers.
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
--
-- Dependencies:
-- P3-026 (curriculum seed strategy)
-- P3-020 (skills table migration - P3-020 in prompts file = skills table)
-- P3-023 (question bank migration)

CREATE TABLE IF NOT EXISTS question_skills (
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  skill_id    UUID NOT NULL REFERENCES skills(id)    ON DELETE RESTRICT,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (question_id, skill_id)
);

-- Index for reverse lookup: which questions assess or develop a skill
CREATE INDEX IF NOT EXISTS question_skills_skill_id_idx
  ON question_skills (skill_id);

COMMENT ON TABLE question_skills IS
  'Maps reusable question bank items to one or more skills they assess or develop. '
  'Backend is the source of truth for question-skill mappings. '
  'Do not store learner mastery, placement, practice attempt, session, progress, or AIM runtime data here.';

COMMENT ON COLUMN question_skills.question_id IS
  'Parent question reference. Cascade-deleted when the question is deleted.';

COMMENT ON COLUMN question_skills.skill_id IS
  'Linked skill reference. RESTRICT prevents deleting a skill that is still linked to question bank items. '
  'Skill display labels must not be used as identifiers.';
