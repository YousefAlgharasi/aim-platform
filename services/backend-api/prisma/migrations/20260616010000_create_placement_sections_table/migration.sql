-- Phase 4 — P4-018
-- Create placement_sections table — stores grammar, vocabulary, reading, and listening sections
-- that belong to a placement test.
--
-- Scope:
-- Placement Test system only.
--
-- Security rules:
-- - Backend is the sole authority for section data.
-- - Clients must not directly write section records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - total_questions is computed by the backend; it is never written by clients.
-- - Do not store AIM Engine runtime data, lesson delivery, practice attempts,
--   session state, progress dashboard, AI Teacher, or Student Web App data here.
--
-- Dependencies:
-- P4-009 (placement-test-contracts.md) — defines placement_tests parent table contract
-- P4-010 (placement-section-contracts.md) — defines placement_sections field contract
-- P4-017 (placement_tests migration) — defines placement_tests table this table references

CREATE TABLE IF NOT EXISTS placement_sections (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to the parent placement test
  placement_test_id UUID          NOT NULL
    REFERENCES placement_tests (id) ON DELETE CASCADE,

  -- Admin-managed display title (e.g. "Grammar", "Vocabulary", "Reading", "Listening")
  title             TEXT          NOT NULL,

  -- Skill identifier — backend-validated against the allowed set
  -- Allowed values: grammar | vocabulary | reading | listening
  skill_code        TEXT          NOT NULL,

  -- Display order within the placement test; unique per test
  order_index       INTEGER       NOT NULL,

  -- Backend-computed count of questions linked to this section
  -- Never set directly by clients or admin API callers
  total_questions   INTEGER       NOT NULL DEFAULT 0,

  -- Audit timestamps — set and updated by backend only
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- Skill code must be one of the allowed placement section types (P4-010 §2.3)
  CONSTRAINT placement_sections_skill_code_check
    CHECK (skill_code IN ('grammar', 'vocabulary', 'reading', 'listening')),

  -- title must be a non-empty string
  CONSTRAINT placement_sections_title_not_empty
    CHECK (char_length(trim(title)) > 0),

  -- order_index must be a positive integer
  CONSTRAINT placement_sections_order_index_positive
    CHECK (order_index > 0),

  -- total_questions must be non-negative (backend-computed; never negative)
  CONSTRAINT placement_sections_total_questions_non_negative
    CHECK (total_questions >= 0),

  -- order_index must be unique within each placement test
  CONSTRAINT placement_sections_unique_order_per_test
    UNIQUE (placement_test_id, order_index)
);

-- Index: look up sections by their parent test (most common query pattern)
CREATE INDEX IF NOT EXISTS placement_sections_test_id_idx
  ON placement_sections (placement_test_id);

-- Index: ordered section list within a test
CREATE INDEX IF NOT EXISTS placement_sections_test_order_idx
  ON placement_sections (placement_test_id, order_index);

-- Index: filter sections by skill (for admin reporting or validation)
CREATE INDEX IF NOT EXISTS placement_sections_skill_code_idx
  ON placement_sections (skill_code);

-- Auto-update updated_at on row mutation
CREATE OR REPLACE FUNCTION set_placement_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS placement_sections_set_updated_at ON placement_sections;

CREATE TRIGGER placement_sections_set_updated_at
BEFORE UPDATE ON placement_sections
FOR EACH ROW
EXECUTE FUNCTION set_placement_sections_updated_at();

COMMENT ON TABLE placement_sections IS
  'Placement test sections (grammar, vocabulary, reading, listening). '
  'Backend is the sole authority for section data and total_questions. '
  'Do not store learner progress, placement attempts, answers, results, '
  'mastery, session state, or AIM runtime data here.';

COMMENT ON COLUMN placement_sections.placement_test_id IS
  'Foreign key to placement_tests. A section belongs to exactly one test.';

COMMENT ON COLUMN placement_sections.skill_code IS
  'Placement section type. Allowed values: grammar, vocabulary, reading, listening. '
  'Backend-validated; clients may not set arbitrary values.';

COMMENT ON COLUMN placement_sections.order_index IS
  'Display order within the placement test. Must be a positive integer, unique per test. '
  'Backend enforces uniqueness at create and update endpoints.';

COMMENT ON COLUMN placement_sections.total_questions IS
  'Backend-computed count of questions linked to this section. '
  'Never written directly by clients or admin API callers.';
