-- P5-035: Create Error Patterns Migration
-- Branch: phase5/P5-035-error-patterns-migration
-- Dependency: P5-034 (mistakes migration)
-- Scope: Backend-controlled persistence for classified error pattern records.
--        Error patterns are backend-derived classifications of recurring
--        mistake behaviour for a (student, skill) pair. They aggregate across
--        multiple mistake rows (P5-034) to identify systematic misconceptions
--        or error types that the AIM Engine uses as `known_error_patterns`
--        context in its analysis (docs/aim-engine/boundary-and-io-contract.md).
--
-- What an error pattern is:
--   Where mistakes track individual incorrect-answer instances per
--   (student, item, skill), an error pattern captures a *classified type* of
--   recurring error a student makes for a given skill — for example, always
--   confusing two specific vocabulary words, or consistently applying the
--   wrong grammatical rule. One error pattern row may be supported by many
--   mistake rows.
--
--   Fields:
--     pattern_type  — a stable machine-readable category (e.g.
--                     'phonetic_confusion', 'grammar_rule_misapplication',
--                     'vocabulary_confound', 'reading_inference_error',
--                     'listening_discrimination_error'). Extensible via the
--                     backend's pattern classifier; the CHECK constraint
--                     enforces the initial Phase 5 set.
--     pattern_code  — an optional free-text sub-code for finer classification
--                     within a type (e.g. "confounds_b_p_phonemes"). Set by
--                     the backend classifier; null if no sub-code applies.
--     supporting_mistake_ids — JSONB array of UUID strings referencing the
--                     mistakes rows that provide evidence for this pattern.
--                     Append-only across updates.
--     occurrence_count — backend-counted total incorrect submissions across
--                     all supporting mistakes. Incremented on each update.
--     confidence    — backend-computed confidence score in [0.0, 1.0] that
--                     this pattern is real (not noise). Updated by the
--                     backend classifier on each evidence addition. Never
--                     used to compute mastery, difficulty, or level.
--     is_active     — FALSE when the pattern has not recurred recently or
--                     when the AIM Engine signals the student has overcome
--                     it. Inactive patterns are retained for audit history.
--
-- Backend authority rules (enforced at this migration layer):
--   - error_patterns rows are created/updated only by backend classification
--     services; clients never write to this table directly.
--   - pattern_type is backend-classified; the CHECK constraint enforces the
--     allowed set for Phase 5.
--   - skill_id is backend-resolved from curriculum data, never from a client
--     payload.
--   - confidence is backend-computed and never a client-supplied value.
--   - occurrence_count is backend-counted, never from a client counter.
--   - supporting_mistake_ids is append-only, never replaced.
--   - Speed and response-time signals must never feed confidence or
--     occurrence_count — those belong to behavioral context only.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: error_patterns
-- ============================================================

CREATE TABLE error_patterns (
    id                          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity: one error pattern per (student, skill, pattern_type).
    -- A student may have at most one active row per (skill, pattern_type);
    -- the UNIQUE constraint below enforces this.
    student_id                  UUID            NOT NULL,
    skill_id                    TEXT            NOT NULL,
    pattern_type                TEXT            NOT NULL,

    -- Optional sub-classification within the pattern_type.
    -- Null when the classifier identifies the type but not a specific sub-code.
    pattern_code                TEXT            NULL,

    -- Accumulated evidence
    supporting_mistake_ids      JSONB           NOT NULL DEFAULT '[]'::jsonb,
    occurrence_count            INTEGER         NOT NULL DEFAULT 1,

    -- Backend-computed confidence in [0.0, 1.0] that this pattern is real.
    -- Updated by the backend classifier on each evidence addition.
    -- Never used to compute mastery, difficulty, or level.
    confidence                  NUMERIC(4, 3)   NOT NULL DEFAULT 0.500,

    -- Active state: FALSE when pattern has not recurred recently or has
    -- been overcome. Inactive rows retained for audit history.
    is_active                   BOOLEAN         NOT NULL DEFAULT TRUE,
    deactivated_at              TIMESTAMPTZ     NULL,

    -- Timestamps
    first_seen_at               TIMESTAMPTZ     NOT NULL,
    last_seen_at                TIMESTAMPTZ     NOT NULL,
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- --------------------------------------------------------
    -- Uniqueness: one active error pattern per (student, skill, pattern_type)
    -- --------------------------------------------------------
    CONSTRAINT error_patterns_student_skill_type_unique
        UNIQUE (student_id, skill_id, pattern_type),

    -- --------------------------------------------------------
    -- Enum constraint: pattern_type must be one of the Phase 5 set
    -- --------------------------------------------------------
    CONSTRAINT error_patterns_pattern_type_check
        CHECK (pattern_type IN (
            'phonetic_confusion',
            'grammar_rule_misapplication',
            'vocabulary_confound',
            'reading_inference_error',
            'listening_discrimination_error'
        )),

    -- --------------------------------------------------------
    -- Integrity constraints
    -- --------------------------------------------------------

    CONSTRAINT error_patterns_skill_id_non_empty_check
        CHECK (LENGTH(TRIM(skill_id)) > 0),

    CONSTRAINT error_patterns_occurrence_count_positive_check
        CHECK (occurrence_count >= 1),

    CONSTRAINT error_patterns_confidence_range_check
        CHECK (confidence >= 0.000 AND confidence <= 1.000),

    CONSTRAINT error_patterns_supporting_mistake_ids_is_array_check
        CHECK (jsonb_typeof(supporting_mistake_ids) = 'array'),

    CONSTRAINT error_patterns_first_before_last_check
        CHECK (first_seen_at <= last_seen_at),

    -- deactivated_at must be set iff is_active = FALSE
    CONSTRAINT error_patterns_deactivated_at_consistency_check
        CHECK (
            (is_active = FALSE AND deactivated_at IS NOT NULL)
            OR  (is_active = TRUE  AND deactivated_at IS NULL)
        ),

    CONSTRAINT error_patterns_deactivated_after_first_seen_check
        CHECK (deactivated_at IS NULL OR deactivated_at >= first_seen_at),

    -- pattern_code non-empty when present
    CONSTRAINT error_patterns_pattern_code_non_empty_check
        CHECK (pattern_code IS NULL OR LENGTH(TRIM(pattern_code)) > 0)
);

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON TABLE error_patterns IS
    'Backend-classified error pattern records: one row per (student, skill, pattern_type). '
    'Aggregates evidence from mistakes (P5-034) to identify systematic misconceptions. '
    'Sent to the AIM Engine as known_error_patterns context '
    '(docs/aim-engine/boundary-and-io-contract.md). AIM Engine reads this table; '
    'it never writes to it.';

COMMENT ON COLUMN error_patterns.id IS
    'Primary key. Backend-issued UUID.';

COMMENT ON COLUMN error_patterns.student_id IS
    'Backend-resolved student id from authenticated session context. Never taken from wire payload.';

COMMENT ON COLUMN error_patterns.skill_id IS
    'Curriculum skill key resolved by the backend from skill-mapping data. '
    'Never accepted verbatim from a client-supplied value.';

COMMENT ON COLUMN error_patterns.pattern_type IS
    'Machine-readable error category. One of the Phase 5 initial set enforced by CHECK. '
    'Extensible in future migrations as new classifiers are added.';

COMMENT ON COLUMN error_patterns.pattern_code IS
    'Optional sub-classification within pattern_type set by the backend classifier '
    '(e.g. "confounds_b_p_phonemes"). Null when no sub-code applies.';

COMMENT ON COLUMN error_patterns.supporting_mistake_ids IS
    'JSONB array of UUID strings referencing mistakes table rows (P5-034) that provide '
    'evidence for this pattern. Append-only — never replaced on update.';

COMMENT ON COLUMN error_patterns.occurrence_count IS
    'Backend-counted total incorrect submissions across all supporting mistakes. '
    'Incremented on each update. Never decremented, never from a client counter.';

COMMENT ON COLUMN error_patterns.confidence IS
    'Backend-computed probability in [0.0, 1.0] that this pattern is a real systematic '
    'error rather than noise. Updated by the classifier on each evidence addition. '
    'Never used to compute mastery, difficulty, or level.';

COMMENT ON COLUMN error_patterns.is_active IS
    'TRUE while the pattern is current. Set FALSE when the pattern has not recurred '
    'recently or when the AIM Engine signals the student has overcome it. '
    'Inactive rows are retained for audit history.';

COMMENT ON COLUMN error_patterns.deactivated_at IS
    'ISO-8601 UTC timestamp of when the pattern was deactivated. '
    'Non-null iff is_active = FALSE, enforced by constraint.';

COMMENT ON COLUMN error_patterns.first_seen_at IS
    'ISO-8601 UTC timestamp of when this pattern was first classified. '
    'Set on row creation, never updated.';

COMMENT ON COLUMN error_patterns.last_seen_at IS
    'ISO-8601 UTC timestamp of the most recent evidence addition for this pattern. '
    'Updated on each supporting mistake addition.';

COMMENT ON COLUMN error_patterns.created_at IS
    'Backend-set row creation timestamp. Never updated after insert.';

COMMENT ON COLUMN error_patterns.updated_at IS
    'Backend-set on every update. Used by AIM state assembly to page through recent changes.';

-- ============================================================
-- Indexes
-- ============================================================

-- All active error patterns for a student (primary AIM Engine context input:
-- only active patterns are passed as known_error_patterns).
CREATE INDEX error_patterns_student_id_active_idx
    ON error_patterns (student_id)
    WHERE is_active = TRUE;

-- Per-student, per-skill active patterns (feeds AIM Engine weakness detection
-- which cross-references error patterns against weakness records).
CREATE INDEX error_patterns_student_id_skill_id_active_idx
    ON error_patterns (student_id, skill_id)
    WHERE is_active = TRUE;

-- Per-student ordered by confidence DESC (enables the state assembly service
-- to surface the most-confident patterns first for AIM Engine context).
CREATE INDEX error_patterns_student_id_confidence_idx
    ON error_patterns (student_id, confidence DESC)
    WHERE is_active = TRUE;

-- Per-item-type distribution across students (feeds backend analytics on
-- which pattern types are most common per skill — not AIM Engine input).
CREATE INDEX error_patterns_skill_id_pattern_type_idx
    ON error_patterns (skill_id, pattern_type);

-- Recency ordering for state assembly pagination.
CREATE INDEX error_patterns_student_id_last_seen_at_idx
    ON error_patterns (student_id, last_seen_at DESC);
