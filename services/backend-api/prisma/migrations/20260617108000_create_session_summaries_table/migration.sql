-- P5-040: Create AIM Session Summaries Migration
-- Branch: phase5/P5-040-aim-session-summaries-migration
-- Dependency: P5-017 (AIM Session Summary Contract)
-- Scope: Backend-controlled persistence for AIM Engine session summary outputs,
-- including educational-only frustration/engagement signals.
--
-- Backend authority rules (enforced at this migration layer):
--   - overall_mastery_shift, frustration_level, engagement_level, signal_basis,
--     and closed_out_at are exclusively AIM Engine outputs.
--   - frustration_level and engagement_level are fixed, coarse educational
--     signals only. This schema deliberately has no severity-scoring column,
--     no free-text clinical note field, and no diagnostic label field, per
--     P5-017 and the Phase 5 charter's educational-not-clinical rule. Adding
--     such a field requires revising P5-017 and re-running the Phase 5
--     security and privacy review, not a plain migration.
--   - student_id is backend-resolved from session context; clients must never
--     submit it directly to a write path against this table.
--   - At most one row per session_id (UNIQUE constraint); a later summary for
--     the same session overwrites the existing row per P5-017 update rules.
--   - Speed and response time are never persisted as raw values here; only
--     coarse signal_basis categories (e.g. increased_hesitation) may reflect
--     timing-derived interpretation, never a raw timing number.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: session_summaries
-- ============================================================

CREATE TABLE session_summaries (
    id                     UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id             UUID            NOT NULL,
    session_id             UUID            NOT NULL,

    items_attempted        INTEGER         NOT NULL,
    items_correct          INTEGER         NOT NULL,
    skills_touched         JSONB           NOT NULL DEFAULT '[]'::jsonb,
    overall_mastery_shift  TEXT            NOT NULL,

    frustration_level      TEXT            NOT NULL,
    engagement_level       TEXT            NOT NULL,
    signal_basis           JSONB           NOT NULL DEFAULT '[]'::jsonb,

    closed_out_at          TIMESTAMPTZ     NOT NULL,

    created_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT session_summaries_items_nonneg_check
        CHECK (items_attempted >= 0 AND items_correct >= 0),

    CONSTRAINT session_summaries_items_correct_bound_check
        CHECK (items_correct <= items_attempted),

    CONSTRAINT session_summaries_skills_touched_is_array_check
        CHECK (jsonb_typeof(skills_touched) = 'array'),

    CONSTRAINT session_summaries_overall_mastery_shift_check
        CHECK (overall_mastery_shift IN (
            'positive',
            'neutral',
            'negative',
            'mixed'
        )),

    CONSTRAINT session_summaries_frustration_level_check
        CHECK (frustration_level IN (
            'none',
            'low',
            'moderate',
            'elevated'
        )),

    CONSTRAINT session_summaries_engagement_level_check
        CHECK (engagement_level IN (
            'low',
            'typical',
            'high'
        )),

    CONSTRAINT session_summaries_signal_basis_is_array_check
        CHECK (jsonb_typeof(signal_basis) = 'array'),

    CONSTRAINT session_summaries_session_id_unique
        UNIQUE (session_id)
);

COMMENT ON TABLE session_summaries IS
    'AIM Engine closing snapshot of a learning session, including educational behavioral signals. At most one row per session_id. Values mirror the validated AimSessionSummaryOutput per P5-017 contract. frustration_level and engagement_level are coarse educational signals only, never clinical or diagnostic.';

COMMENT ON COLUMN session_summaries.student_id IS
    'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';

COMMENT ON COLUMN session_summaries.session_id IS
    'References the learning session this summary closes out. Unique: a later summary for the same session overwrites this row rather than inserting a second one.';

COMMENT ON COLUMN session_summaries.items_attempted IS
    'Total items attempted in the session as of this summary.';

COMMENT ON COLUMN session_summaries.items_correct IS
    'Total items answered correctly in the session as of this summary. Always <= items_attempted.';

COMMENT ON COLUMN session_summaries.skills_touched IS
    'JSONB array of distinct skill keys involved in the session.';

COMMENT ON COLUMN session_summaries.overall_mastery_shift IS
    'Coarse directional summary of how the session affected mastery across skills_touched. Descriptive only; authoritative per-skill values remain in student_skill_states.';

COMMENT ON COLUMN session_summaries.frustration_level IS
    'Coarse, educational-only signal: none, low, moderate, or elevated. Never a clinical or psychological assessment. No more granular or free-text representation exists in this schema by design.';

COMMENT ON COLUMN session_summaries.engagement_level IS
    'Coarse, educational-only signal: low, typical, or high.';

COMMENT ON COLUMN session_summaries.signal_basis IS
    'JSONB array of fixed-enum categories describing the coarse evidence behind frustration_level and engagement_level (e.g. repeated_incorrect_streak, increased_hesitation). Never a free-text explanation.';

COMMENT ON COLUMN session_summaries.closed_out_at IS
    'When the AIM Engine determined the session reached a summarizable close-out point.';

COMMENT ON COLUMN session_summaries.created_at IS
    'Backend-set on first persistence for this session_id. Never updated after.';

COMMENT ON COLUMN session_summaries.updated_at IS
    'Backend-set on every persistence write for this record.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX session_summaries_student_id_idx
    ON session_summaries (student_id);

CREATE INDEX session_summaries_closed_out_at_idx
    ON session_summaries (closed_out_at);

CREATE INDEX session_summaries_frustration_level_idx
    ON session_summaries (frustration_level);
