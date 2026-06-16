-- Phase 3 — P3-023
-- Create lesson_skills mapping table.
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for lesson-skill mappings.
-- - Clients must not directly write lesson_skills records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - CRITICAL: A lesson cannot be published without at least one row in this table pointing to a
--   published skill. This rule is enforced at the backend publish endpoint (see P3-006
--   lesson-skill-linking-rules.md and P3-039 lesson-skill validation).
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
--
-- Dependencies:
-- P3-022 (lessons table migration)
-- P3-020 (skills table migration — P3-020 in prompts file = skills table)

CREATE TABLE IF NOT EXISTS lesson_skills (
  lesson_id  UUID  NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  skill_id   UUID  NOT NULL REFERENCES skills(id)  ON DELETE RESTRICT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (lesson_id, skill_id)
);

-- Index for reverse lookup: which lessons use a skill
CREATE INDEX IF NOT EXISTS lesson_skills_skill_id_idx
  ON lesson_skills (skill_id);

COMMENT ON TABLE lesson_skills IS
  'Maps lessons to one or more skills. '
  'CRITICAL: A lesson cannot be published without at least one row here pointing to a published skill. '
  'Enforced by the backend publish endpoint (P3-006, P3-039). '
  'Cascade delete on lesson removal; RESTRICT on skill removal to prevent orphaned lesson-skill links.';

COMMENT ON COLUMN lesson_skills.lesson_id IS
  'Parent lesson reference. Cascade-deleted when the lesson is deleted.';

COMMENT ON COLUMN lesson_skills.skill_id IS
  'Linked skill reference. RESTRICT prevents deleting a skill that is still linked to lessons.';
