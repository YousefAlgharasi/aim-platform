-- Phase 4 — P4-019
-- Create placement_questions table — stores the placement question bank,
-- kept separate from runtime attempt records.
--
-- Scope:
-- Placement Test system only.
--
-- Security rules:
-- - Backend is the sole authority for question data.
-- - Clients must not directly write question records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - skill_code is backend-derived from the parent section; it is never set directly on the question.
-- - Answer keys and correct_answer are never exposed to students (exposed only in backend scoring).
-- - Do not store AIM Engine runtime data, lesson delivery, practice attempts,
--   session state, progress dashboard, AI Teacher, or Student Web App data here.
--
-- Dependencies:
-- P4-010 (placement-section-contracts.md) — defines placement_sections parent table contract
-- P4-011 (placement-question-contracts.md) — defines placement_questions field contract
-- P4-018 (placement_sections migration) — defines placement_sections table this table references

CREATE TABLE IF NOT EXISTS placement_questions (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to the parent placement section
  placement_section_id  UUID          NOT NULL
    REFERENCES placement_sections (id) ON DELETE CASCADE,

  -- Question type — backend-validated against the allowed set (P4-011 §2.3)
  -- Allowed values: multiple_choice | true_false | fill_blank | listening_choice
  question_type         TEXT          NOT NULL,

  -- Question text shown to the student
  prompt                TEXT          NOT NULL,

  -- Optional media asset URL (required for listening_choice type)
  -- Backend enforces media_url presence when question_type = 'listening_choice'
  media_url             TEXT,

  -- Display order within the placement section; unique per section
  order_index           INTEGER       NOT NULL,

  -- Correct answer stored server-side only — never exposed to students
  -- Stored as TEXT to accommodate multiple_choice keys, true/false values, and fill-blank answers
  correct_answer        TEXT          NOT NULL,

  -- Audit timestamps — set and updated by backend only
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- question_type must be one of the allowed placement question types (P4-011 §2.3)
  CONSTRAINT placement_questions_type_check
    CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'listening_choice')),

  -- prompt must be a non-empty string
  CONSTRAINT placement_questions_prompt_not_empty
    CHECK (char_length(trim(prompt)) > 0),

  -- correct_answer must be a non-empty string
  CONSTRAINT placement_questions_correct_answer_not_empty
    CHECK (char_length(trim(correct_answer)) > 0),

  -- order_index must be a positive integer
  CONSTRAINT placement_questions_order_index_positive
    CHECK (order_index > 0),

  -- order_index must be unique within each placement section
  CONSTRAINT placement_questions_unique_order_per_section
    UNIQUE (placement_section_id, order_index)
);

-- Index: look up questions by their parent section (most common query pattern)
CREATE INDEX IF NOT EXISTS placement_questions_section_id_idx
  ON placement_questions (placement_section_id);

-- Index: ordered question list within a section
CREATE INDEX IF NOT EXISTS placement_questions_section_order_idx
  ON placement_questions (placement_section_id, order_index);

-- Index: filter questions by type (for admin reporting and validation)
CREATE INDEX IF NOT EXISTS placement_questions_type_idx
  ON placement_questions (question_type);

-- Auto-update updated_at on row mutation
CREATE OR REPLACE FUNCTION set_placement_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS placement_questions_set_updated_at ON placement_questions;

CREATE TRIGGER placement_questions_set_updated_at
BEFORE UPDATE ON placement_questions
FOR EACH ROW
EXECUTE FUNCTION set_placement_questions_updated_at();

COMMENT ON TABLE placement_questions IS
  'Placement test question bank. Stores questions separately from runtime attempt records. '
  'Backend is the sole authority for question data. '
  'correct_answer is server-side only and must never be exposed to students or Flutter clients. '
  'Do not store learner attempts, answers, results, mastery, session state, or AIM runtime data here.';

COMMENT ON COLUMN placement_questions.placement_section_id IS
  'Foreign key to placement_sections. A question belongs to exactly one section.';

COMMENT ON COLUMN placement_questions.question_type IS
  'Placement question type. Allowed values: multiple_choice, true_false, fill_blank, listening_choice. '
  'Backend-validated; clients may not set arbitrary values.';

COMMENT ON COLUMN placement_questions.prompt IS
  'Question text shown to the student. Non-empty string. Backend-owned.';

COMMENT ON COLUMN placement_questions.media_url IS
  'Optional media asset URL. Required by backend when question_type = listening_choice. '
  'Null for all other question types unless an image is supplied.';

COMMENT ON COLUMN placement_questions.order_index IS
  'Display order within the placement section. Must be a positive integer, unique per section. '
  'Backend enforces uniqueness at create and update endpoints.';

COMMENT ON COLUMN placement_questions.correct_answer IS
  'Server-side answer key. Never exposed to students or Flutter clients. '
  'Backend uses this for objective answer validation during placement scoring.';
