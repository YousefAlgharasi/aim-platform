-- P5-032: Create Lesson Attempts Migration
-- Branch: phase5/P5-032-lesson-attempts-migration
-- Dependency: P3-022 (Lessons Table Migration), P5-010 (AIM Attempt Input Contract)
-- Scope: Backend-owned attempt records used to assemble AimAttemptInput
--        (P5-010) entries for POST /aim/v1/analysis. The AIM Engine never
--        writes to this table; it only receives validated entries derived
--        from these rows.
--
-- Backend authority rules (enforced at this migration layer):
--   - is_correct is backend-evaluated only; clients never submit or imply
--     this value directly.
--   - skill_ids is a backend-resolved JSONB array of curriculum skill keys,
--     never accepted verbatim from a client-supplied list.
--   - attempt_number_for_item is backend-counted from existing attempt
--     history for the (learning_session_id, item_id) pair.
--   - presented_difficulty uses the Phase 0/1 locked 1-4 scale and reflects
--     what the backend actually presented; it does not represent a difficulty
--     decision for the next presentation (that is an AIM Engine output,
--     P5-014, persisted elsewhere).
--   - response_time_ms and attempt-level behavioral fields are raw signals
--     and must never feed mastery, level, or difficulty logic in any layer.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: lesson_attempts
-- ============================================================

CREATE TABLE lesson_attempts (
    id                              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_session_id             UUID            NOT NULL,
    student_id                      UUID            NOT NULL,

    item_id                         UUID            NOT NULL,
    item_type                       TEXT            NOT NULL,
    skill_ids                       JSONB           NOT NULL DEFAULT '[]'::jsonb,

    presented_difficulty            SMALLINT        NOT NULL,

    answer_format                   TEXT            NOT NULL,
    answer_value                    TEXT            NOT NULL,
    options_presented_count         SMALLINT        NULL,

    is_correct                      BOOLEAN         NOT NULL,
    attempt_number_for_item         INTEGER         NOT NULL,

    started_at                      TIMESTAMPTZ     NOT NULL,
    submitted_at                    TIMESTAMPTZ     NOT NULL,
    response_time_ms                INTEGER         NOT NULL,

    answer_change_count             INTEGER         NOT NULL DEFAULT 0,
    hesitation_before_submit_ms     INTEGER         NULL,
    used_hint                       BOOLEAN         NOT NULL DEFAULT FALSE,
    abandoned_first_then_retried    BOOLEAN         NOT NULL DEFAULT FALSE,

    created_at                      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT lesson_attempts_item_type_check
        CHECK (item_type IN (
            'lesson_question',
            'practice_question',
            'review_question',
            'drill_question'
        )),

    CONSTRAINT lesson_attempts_presented_difficulty_range_check
        CHECK (presented_difficulty BETWEEN 1 AND 4),

    CONSTRAINT lesson_attempts_answer_format_check
        CHECK (answer_format IN (
            'multiple_choice',
            'true_false',
            'fill_blank',
            'listening_choice',
            'free_text'
        )),

    CONSTRAINT lesson_attempts_options_count_non_negative_check
        CHECK (options_presented_count IS NULL OR options_presented_count >= 0),

    CONSTRAINT lesson_attempts_options_count_format_consistency_check
        CHECK (
            (answer_format IN ('multiple_choice', 'true_false', 'listening_choice')
                AND options_presented_count IS NOT NULL)
            OR (answer_format IN ('fill_blank', 'free_text')
                AND options_presented_count IS NULL)
        ),

    CONSTRAINT lesson_attempts_attempt_number_positive_check
        CHECK (attempt_number_for_item >= 1),

    CONSTRAINT lesson_attempts_response_time_non_negative_check
        CHECK (response_time_ms >= 0),

    CONSTRAINT lesson_attempts_started_before_submitted_check
        CHECK (started_at <= submitted_at),

    CONSTRAINT lesson_attempts_answer_change_count_non_negative_check
        CHECK (answer_change_count >= 0),

    CONSTRAINT lesson_attempts_hesitation_non_negative_check
        CHECK (hesitation_before_submit_ms IS NULL OR hesitation_before_submit_ms >= 0),

    CONSTRAINT lesson_attempts_skill_ids_is_array_check
        CHECK (jsonb_typeof(skill_ids) = 'array')
);

COMMENT ON TABLE lesson_attempts IS
    'Backend-owned attempt records. Source of AimAttemptInput entries (P5-010) assembled by the backend for POST /aim/v1/analysis.';

COMMENT ON COLUMN lesson_attempts.id IS
    'Primary key. Backend-issued UUID surfaced to the AIM Engine as attemptId.';

COMMENT ON COLUMN lesson_attempts.learning_session_id IS
    'References the owning learning session. Must match the sessionId carried in the accompanying session input segment when sent to the AIM Engine. No FK constraint declared in this migration to avoid a forward dependency on the still-unmerged learning_sessions migration; downstream migration may add the FK once both tables are merged in order.';

COMMENT ON COLUMN lesson_attempts.student_id IS
    'Backend-resolved student id, denormalized from the owning session for fast per-student queries.';

COMMENT ON COLUMN lesson_attempts.item_id IS
    'Backend-issued identifier of the question, lesson item, or practice item attempted.';

COMMENT ON COLUMN lesson_attempts.item_type IS
    'Backend-classified item type. One of lesson_question, practice_question, review_question, drill_question. Must be consistent with the owning session sessionType.';

COMMENT ON COLUMN lesson_attempts.skill_ids IS
    'JSONB array of curriculum skill keys linked to the item, resolved by the backend from curriculum skill-mapping data. Never accepted verbatim from the client.';

COMMENT ON COLUMN lesson_attempts.presented_difficulty IS
    'Backend-recorded difficulty level (1-4, Phase 0/1 locked scale) at which the item was presented for this attempt. Informational context only; the AIM Engine decides the next difficulty separately (P5-014).';

COMMENT ON COLUMN lesson_attempts.answer_format IS
    'Backend-classified answer format. One of multiple_choice, true_false, fill_blank, listening_choice, free_text.';

COMMENT ON COLUMN lesson_attempts.answer_value IS
    'Backend-normalized literal answer content submitted by the student. Raw input only; not itself an AIM-owned decision field.';

COMMENT ON COLUMN lesson_attempts.options_presented_count IS
    'Number of answer options presented for option-based formats. Null for fill_blank and free_text per the format-consistency check.';

COMMENT ON COLUMN lesson_attempts.is_correct IS
    'Backend-evaluated correctness. Always computed by backend scoring logic; never trusted from a client-submitted value.';

COMMENT ON COLUMN lesson_attempts.attempt_number_for_item IS
    'Backend-counted ordinal of this attempt for this item within the session. 1 for the first try. Never trusted from a client counter.';

COMMENT ON COLUMN lesson_attempts.started_at IS
    'ISO-8601 UTC timestamp of when the item was presented to the student.';

COMMENT ON COLUMN lesson_attempts.submitted_at IS
    'ISO-8601 UTC timestamp of when the backend recorded the answer submission.';

COMMENT ON COLUMN lesson_attempts.response_time_ms IS
    'submitted_at minus started_at in milliseconds, computed by the backend. Behavioral context only; must never feed mastery, level, or difficulty logic.';

COMMENT ON COLUMN lesson_attempts.answer_change_count IS
    'Backend-counted number of times the student changed their selected or written answer before submission.';

COMMENT ON COLUMN lesson_attempts.hesitation_before_submit_ms IS
    'Raw time between first interaction and final submission, in milliseconds, when distinct from response_time_ms. Null when not separately tracked.';

COMMENT ON COLUMN lesson_attempts.used_hint IS
    'Whether a backend-provided hint was shown before submission.';

COMMENT ON COLUMN lesson_attempts.abandoned_first_then_retried IS
    'Whether the student navigated away from the item before returning to complete it.';

COMMENT ON COLUMN lesson_attempts.created_at IS
    'Backend-set on row creation. Never updated after.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX lesson_attempts_learning_session_id_idx
    ON lesson_attempts (learning_session_id);

CREATE INDEX lesson_attempts_student_id_idx
    ON lesson_attempts (student_id);

CREATE INDEX lesson_attempts_item_id_idx
    ON lesson_attempts (item_id);

CREATE INDEX lesson_attempts_learning_session_id_item_id_idx
    ON lesson_attempts (learning_session_id, item_id);

CREATE INDEX lesson_attempts_submitted_at_idx
    ON lesson_attempts (submitted_at);

CREATE INDEX lesson_attempts_is_correct_idx
    ON lesson_attempts (is_correct);

CREATE INDEX lesson_attempts_skill_ids_gin_idx
    ON lesson_attempts USING GIN (skill_ids);
