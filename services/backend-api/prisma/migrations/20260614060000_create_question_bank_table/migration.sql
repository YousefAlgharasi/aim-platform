-- Phase 3 — P3-026
-- Create question_bank table — reusable question content for curriculum assessment.
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for question status, type, and skill links.
-- - Clients must not directly write question records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - Status transitions are backend-owned and follow the Phase 3 content status lifecycle.
-- - A question cannot be published without at least one linked published skill (enforced at backend).
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
-- - is_correct must never be exposed to learner-facing clients during active sessions.
--
-- Dependencies:
-- P3-014 (question bank contract)
-- P3-020 (skills table migration — question_skill_mappings references skills)

-- ─── Question Bank Items ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS question_bank (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Question type — set on creation, never changed
  -- Values: multiple_choice | multiple_select | true_false |
  --         fill_in_the_blank | short_answer | ordering | matching
  type            TEXT        NOT NULL,

  -- The question text presented to the learner — required, non-empty
  stem            TEXT        NOT NULL,

  -- Optional rich/structured version of the stem (stored as JSONB)
  rich_stem       JSONB       DEFAULT NULL,

  -- Difficulty label — required
  -- Values: beginner | elementary | intermediate | upper_intermediate | advanced
  difficulty      TEXT        NOT NULL,

  -- Optional post-answer explanation shown after submission
  explanation     TEXT        DEFAULT NULL,

  -- Optional hint surfaced before or during answering
  hint            TEXT        DEFAULT NULL,

  -- Free-form admin tags for search and organisation (stored as text array)
  tags            TEXT[]      NOT NULL DEFAULT '{}',

  -- Backend-owned content lifecycle status
  -- Values: draft | published | archived
  status          TEXT        NOT NULL DEFAULT 'draft',

  -- Author — set by backend from authenticated user context
  created_by      UUID        NOT NULL,

  -- Audit timestamps — set and updated by backend only
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Type constraint
  CONSTRAINT question_bank_type_check
    CHECK (type IN (
      'multiple_choice',
      'multiple_select',
      'true_false',
      'fill_in_the_blank',
      'short_answer',
      'ordering',
      'matching'
    )),

  -- Difficulty constraint
  CONSTRAINT question_bank_difficulty_check
    CHECK (difficulty IN (
      'beginner',
      'elementary',
      'intermediate',
      'upper_intermediate',
      'advanced'
    )),

  -- Status constraint aligned with Phase 3 content status lifecycle (P3-007)
  CONSTRAINT question_bank_status_check
    CHECK (status IN ('draft', 'published', 'archived')),

  -- Stem must be non-empty
  CONSTRAINT question_bank_stem_nonempty_check
    CHECK (char_length(trim(stem)) > 0)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS question_bank_status_idx
  ON question_bank (status);

CREATE INDEX IF NOT EXISTS question_bank_type_idx
  ON question_bank (type);

CREATE INDEX IF NOT EXISTS question_bank_difficulty_idx
  ON question_bank (difficulty);

CREATE INDEX IF NOT EXISTS question_bank_created_by_idx
  ON question_bank (created_by);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_question_bank_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS question_bank_set_updated_at ON question_bank;

CREATE TRIGGER question_bank_set_updated_at
BEFORE UPDATE ON question_bank
FOR EACH ROW
EXECUTE FUNCTION set_question_bank_updated_at();

-- ─── Answer Choices ─────────────────────────────────────────────────────────
-- Used by: multiple_choice, multiple_select, true_false, ordering, matching

CREATE TABLE IF NOT EXISTS question_choices (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent question — set on creation, never changed
  question_id     UUID        NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,

  -- Display text of this choice — required, non-empty
  text            TEXT        NOT NULL,

  -- Optional rich/structured version of the choice text
  rich_text       JSONB       DEFAULT NULL,

  -- Whether this choice is a correct answer
  -- Rules per type:
  --   multiple_choice:  exactly one choice must be true
  --   multiple_select:  one or more choices must be true
  --   true_false:       exactly one of the two choices must be true
  --   ordering/matching: not used here — correct order/pairs in question_answers
  is_correct      BOOLEAN     NOT NULL DEFAULT false,

  -- Display order within the question — must be positive and unique within question
  sort_order      INTEGER     NOT NULL DEFAULT 0,

  -- Optional per-choice explanation shown after submission
  explanation     TEXT        DEFAULT NULL,

  -- Audit timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Text must be non-empty
  CONSTRAINT question_choices_text_nonempty_check
    CHECK (char_length(trim(text)) > 0),

  -- Sort order must be non-negative
  CONSTRAINT question_choices_sort_order_check
    CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS question_choices_question_id_idx
  ON question_choices (question_id);

CREATE INDEX IF NOT EXISTS question_choices_question_sort_order_idx
  ON question_choices (question_id, sort_order);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_question_choices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS question_choices_set_updated_at ON question_choices;

CREATE TRIGGER question_choices_set_updated_at
BEFORE UPDATE ON question_choices
FOR EACH ROW
EXECUTE FUNCTION set_question_choices_updated_at();

-- ─── Answer Metadata ────────────────────────────────────────────────────────
-- Used by: fill_in_the_blank, short_answer, ordering, matching
-- Stores the type-specific correct answer definition separate from choices.

CREATE TABLE IF NOT EXISTS question_answers (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent question — set on creation, never changed; one record per question
  question_id     UUID        NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,

  -- Answer type — must match parent question type
  -- Values: fill_blank | short_text | ordered_sequence | matched_pairs
  answer_type     TEXT        NOT NULL,

  -- Type-specific answer value stored as JSONB:
  --   fill_blank:        { blanks: [{position, accepted_values}], case_sensitive }
  --   short_text:        { model_answer, grading_note }
  --   ordered_sequence:  { sequence: [choice_id, ...] }
  --   matched_pairs:     { pairs: [{left: choice_id, right: choice_id}] }
  value           JSONB       NOT NULL,

  -- Optional post-answer explanation for this specific answer
  explanation     TEXT        DEFAULT NULL,

  -- Audit timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One answer record per question
  CONSTRAINT question_answers_question_id_unique UNIQUE (question_id),

  -- Answer type constraint
  CONSTRAINT question_answers_answer_type_check
    CHECK (answer_type IN (
      'fill_blank',
      'short_text',
      'ordered_sequence',
      'matched_pairs'
    ))
);

CREATE INDEX IF NOT EXISTS question_answers_question_id_idx
  ON question_answers (question_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_question_answers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS question_answers_set_updated_at ON question_answers;

CREATE TRIGGER question_answers_set_updated_at
BEFORE UPDATE ON question_answers
FOR EACH ROW
EXECUTE FUNCTION set_question_answers_updated_at();

-- ─── Table Comments ─────────────────────────────────────────────────────────

COMMENT ON TABLE question_bank IS
  'Reusable curriculum question items. '
  'Backend is the source of truth for status, type, and skill links. '
  'A question cannot be published without at least one linked published skill — '
  'enforced at the backend publish endpoint (P3-014). '
  'is_correct must never be exposed to learner-facing clients during active sessions. '
  'Do not store learner responses, attempt history, mastery, session, or AIM runtime data here.';

COMMENT ON COLUMN question_bank.type IS
  'Question type — set on creation and immutable. '
  'Allowed: multiple_choice, multiple_select, true_false, fill_in_the_blank, short_answer, ordering, matching.';

COMMENT ON COLUMN question_bank.difficulty IS
  'Difficulty label. Allowed: beginner, elementary, intermediate, upper_intermediate, advanced.';

COMMENT ON COLUMN question_bank.status IS
  'Backend-owned content lifecycle status. Allowed: draft, published, archived. '
  'Publish requires at least one linked published skill (backend enforced).';

COMMENT ON COLUMN question_bank.rich_stem IS
  'Optional structured/rich-text version of the stem. Stored as JSONB. '
  'Must not contain learner data, secrets, or provider keys.';

COMMENT ON TABLE question_choices IS
  'Answer choices for question_bank items. '
  'is_correct must not be returned to learner-facing clients during active sessions. '
  'Cascade-deleted when the parent question is deleted.';

COMMENT ON COLUMN question_choices.is_correct IS
  'Whether this choice is a correct answer. '
  'For multiple_choice: exactly one true. For multiple_select: one or more true. '
  'For true_false: exactly one true. '
  'Not used for ordering/matching — see question_answers table.';

COMMENT ON TABLE question_answers IS
  'Type-specific correct answer metadata for question_bank items. '
  'One record per question. Used for fill_in_the_blank, short_answer, ordering, matching. '
  'Cascade-deleted when the parent question is deleted.';

COMMENT ON COLUMN question_answers.value IS
  'Type-specific answer value as JSONB. '
  'Schema varies by answer_type: fill_blank, short_text, ordered_sequence, matched_pairs. '
  'Must not expose learner data, secrets, or AIM internals.';
