-- Phase 3 — P3-024
-- Create lesson_objectives table — many-to-many mapping between lessons and
-- learning objectives, allowing lessons to declare explicit objectives.
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for lesson-to-objective links.
-- - Clients must not directly write mapping records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - This mapping is for curriculum content coverage only — it does not represent
--   learner progress, mastery, placement, retention, or recommendation results.
-- - Preserve the critical rule that every lesson must still be linkable to one or
--   more skills (enforced separately by the lesson_skills mapping).
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
--
-- Dependencies:
-- P3-021 (objectives table migration)
-- P3-022 (lessons table migration)

CREATE TABLE IF NOT EXISTS lesson_objectives (
  -- Owning lesson — when a lesson is removed, its objective links are removed
  lesson_id     UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

  -- Linked objective — an objective referenced by a lesson cannot be hard-deleted
  objective_id  UUID        NOT NULL REFERENCES objectives(id) ON DELETE RESTRICT,

  -- Audit timestamp — set by backend only
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (lesson_id, objective_id)
);

-- Index for reverse lookups (which lessons declare a given objective)
CREATE INDEX IF NOT EXISTS lesson_objectives_objective_id_idx
  ON lesson_objectives (objective_id);

COMMENT ON TABLE lesson_objectives IS
  'Mapping between lessons and the learning objectives they declare. '
  'Backend is the source of truth for this mapping; clients must not write to it directly. '
  'Used for curriculum content coverage and planning only — must not be used for '
  'learner mastery, progress, placement, session, or AIM runtime data. '
  'Does not replace the lesson_skills mapping: every lesson must still be linkable '
  'to one or more skills.';

COMMENT ON COLUMN lesson_objectives.lesson_id IS
  'Lesson declaring the objective. Cascade-deleted with the lesson.';

COMMENT ON COLUMN lesson_objectives.objective_id IS
  'Objective declared by the lesson. An objective referenced here cannot be hard-deleted.';
