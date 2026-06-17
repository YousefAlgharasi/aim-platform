-- P5-033: Create Answers Migration
-- Branch: phase5/P5-033-answers-migration
-- Dependency: P5-032 (lesson_attempts migration)
-- Scope: Backend-controlled answer detail records per lesson attempt.
--        One row per attempt, capturing the normalized answer value,
--        format, correctness, and option context needed by:
--          - AIM Engine error-pattern analysis (feeds P5-035 error_patterns)
--          - AIM Engine mistake detection (feeds P5-034 mistakes)
--          - Backend correctness evaluation (is_correct, backend-owned)
--
-- Backend authority rules (enforced at this migration layer):
--   - is_correct is backend-evaluated only; clients never submit or imply
--     this value directly.
--   - answer_value is the backend-normalized literal submitted by the student;
--     it is never an AIM-owned decision field.
--   - answer_format is backend-classified; never derived from a raw client field.
--   - options_presented_count is null for non-option-based formats (fill_blank,
--     free_text) and non-null for option-based formats (multiple_choice,
--     true_false, listening_choice), enforced by constraint.
--   - One row per lesson_attempt_id (UNIQUE constraint). An answer is
--     immutable once submitted; no UPDATE paths are expected against this table.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: answers
-- ============================================================

CREATE TABLE answers (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Owning attempt reference (no FK to avoid forward-dependency issues
    -- if lesson_attempts branch is not yet merged; see lesson_attempts comment
    -- on learning_session_id for the same pattern used in P5-032).
    lesson_attempt_id       UUID            NOT NULL,

    -- Student and item context (denormalized from the owning attempt for
    -- efficient per-student and per-item answer lookups without a join).
    student_id              UUID            NOT NULL,
    item_id                 UUID            NOT NULL,

    -- Answer content
    answer_format           TEXT            NOT NULL,
    answer_value            TEXT            NOT NULL,
    options_presented_count SMALLINT        NULL,

    -- Backend-evaluated correctness. Never trusted from a client-submitted value.
    is_correct              BOOLEAN         NOT NULL,

    -- Timestamps
    submitted_at            TIMESTAMPTZ     NOT NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- --------------------------------------------------------
    -- Uniqueness: one answer row per lesson attempt
    -- --------------------------------------------------------
    CONSTRAINT answers_lesson_attempt_id_unique
        UNIQUE (lesson_attempt_id),

    -- --------------------------------------------------------
    -- Enum constraints
    -- --------------------------------------------------------
    CONSTRAINT answers_answer_format_check
        CHECK (answer_format IN (
            'multiple_choice',
            'true_false',
            'fill_blank',
            'listening_choice',
            'free_text'
        )),

    -- answer_value must be non-empty after trimming
    CONSTRAINT answers_answer_value_non_empty_check
        CHECK (LENGTH(TRIM(answer_value)) > 0),

    -- --------------------------------------------------------
    -- Format-consistency: options_presented_count must be
    -- non-null for option-based formats, null for text formats.
    -- Mirrors the equivalent constraint in lesson_attempts (P5-032).
    -- --------------------------------------------------------
    CONSTRAINT answers_options_count_format_consistency_check
        CHECK (
            (answer_format IN ('multiple_choice', 'true_false', 'listening_choice')
                AND options_presented_count IS NOT NULL)
            OR (answer_format IN ('fill_blank', 'free_text')
                AND options_presented_count IS NULL)
        ),

    CONSTRAINT answers_options_count_non_negative_check
        CHECK (options_presented_count IS NULL OR options_presented_count >= 0)
);

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON TABLE answers IS
    'Backend-owned normalized answer record per lesson attempt. One row per attempt. '
    'Source of answer content for AIM Engine error-pattern analysis (P5-035) and '
    'mistake detection (P5-034). is_correct is always backend-evaluated.';

COMMENT ON COLUMN answers.id IS
    'Primary key. Backend-issued UUID.';

COMMENT ON COLUMN answers.lesson_attempt_id IS
    'References the owning lesson_attempts row. UNIQUE — one answer per attempt. '
    'No FK constraint declared in this migration to avoid a forward dependency on '
    'the lesson_attempts branch (same pattern as lesson_attempts.learning_session_id '
    'in P5-032); a follow-up migration may add the FK once merge order is settled.';

COMMENT ON COLUMN answers.student_id IS
    'Backend-resolved student id, denormalized from the owning attempt for fast '
    'per-student answer history queries without a join.';

COMMENT ON COLUMN answers.item_id IS
    'Backend-issued identifier of the question or item being answered. Denormalized '
    'from the owning attempt for fast per-item answer distribution queries.';

COMMENT ON COLUMN answers.answer_format IS
    'Backend-classified answer format. One of: multiple_choice, true_false, '
    'fill_blank, listening_choice, free_text. Must match the answer_format on '
    'the owning lesson_attempt row.';

COMMENT ON COLUMN answers.answer_value IS
    'Backend-normalized literal answer submitted by the student. For option-based '
    'formats, the selected option identifier (e.g. "B"). For fill_blank / free_text, '
    'the written response. Behavioral input only — never an AIM-owned decision field.';

COMMENT ON COLUMN answers.options_presented_count IS
    'Number of answer options presented to the student. Non-null for option-based '
    'formats (multiple_choice, true_false, listening_choice); null for fill_blank '
    'and free_text. Enforced by the format-consistency constraint.';

COMMENT ON COLUMN answers.is_correct IS
    'Backend-evaluated correctness using the existing scoring logic from the '
    'features/lessons service. Never trusted from a client-submitted value and '
    'never overridden by the AIM Engine.';

COMMENT ON COLUMN answers.submitted_at IS
    'ISO-8601 UTC timestamp of when the backend recorded the answer submission. '
    'Copied from the owning lesson_attempt row for time-range queries on answers '
    'without joining lesson_attempts.';

COMMENT ON COLUMN answers.created_at IS
    'Backend-set row creation timestamp. Never updated after insert.';

-- ============================================================
-- Indexes
-- ============================================================

-- Fast lookup of all answers for a given student (per-student answer history,
-- used by error-pattern detection and mistake aggregation services).
CREATE INDEX answers_student_id_idx
    ON answers (student_id);

-- Fast lookup of all answers for a given item (per-item answer distribution,
-- used by error-pattern detection to identify common wrong answers).
CREATE INDEX answers_item_id_idx
    ON answers (item_id);

-- Combined index: per-student per-item answer history (feeds mistake detection
-- which groups by student + item to identify recurring errors).
CREATE INDEX answers_student_id_item_id_idx
    ON answers (student_id, item_id);

-- Partial index: incorrect answers only (primary input for mistake and
-- error-pattern analysis; filters out correct answers at the index level).
CREATE INDEX answers_incorrect_student_item_idx
    ON answers (student_id, item_id)
    WHERE is_correct = FALSE;

-- Submitted-at index for time-range queries (e.g. answers in a session window).
CREATE INDEX answers_submitted_at_idx
    ON answers (submitted_at);
