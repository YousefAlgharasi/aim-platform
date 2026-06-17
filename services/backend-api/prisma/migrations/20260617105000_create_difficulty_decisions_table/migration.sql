-- P5-037: Create Difficulty Decisions Migration
-- Branch: phase5/P5-037-difficulty-decisions-migration
-- Dependency: P5-014 (Difficulty Decision Contract)
-- Scope: Backend-controlled persistence for AIM Engine difficulty decision outputs.
--
-- Backend authority rules (enforced at this migration layer):
--   - current_difficulty and rationale are exclusively AIM Engine outputs.
--     No client writes are permitted.
--   - student_id is backend-resolved from session context; clients must never
--     submit it directly to a write path against this table.
--   - One row per (student_id, skill_id): this is a current-state table, not a
--     decision-history table. A full audit trail lives in the AIM audit log.
--   - The step constraint (at most one level of change per decision) is
--     enforced here as defense-in-depth in addition to backend Stage 5
--     response validation per P5-014.
--   - Speed and response time must never feed current_difficulty or
--     rationale — those signals belong to behavioral context only.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: difficulty_decisions
-- ============================================================

CREATE TABLE difficulty_decisions (
    id                     UUID            PRIMARY KEY,
    student_id             UUID            NOT NULL,
    skill_id               TEXT            NOT NULL,

    current_difficulty     SMALLINT        NOT NULL,
    previous_difficulty    SMALLINT        NOT NULL,
    rationale              TEXT            NOT NULL,
    based_on_attempt_ids   JSONB           NOT NULL DEFAULT '[]'::jsonb,

    decided_at             TIMESTAMPTZ     NOT NULL,

    created_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT difficulty_decisions_current_difficulty_range_check
        CHECK (current_difficulty BETWEEN 1 AND 4),

    CONSTRAINT difficulty_decisions_previous_difficulty_range_check
        CHECK (previous_difficulty BETWEEN 1 AND 4),

    CONSTRAINT difficulty_decisions_step_constraint_check
        CHECK (ABS(current_difficulty - previous_difficulty) <= 1),

    CONSTRAINT difficulty_decisions_rationale_check
        CHECK (rationale IN (
            'mastery_increase',
            'mastery_decrease',
            'consistent_performance',
            'insufficient_data_hold'
        )),

    CONSTRAINT difficulty_decisions_based_on_attempt_ids_is_array_check
        CHECK (jsonb_typeof(based_on_attempt_ids) = 'array'),

    CONSTRAINT difficulty_decisions_student_skill_unique
        UNIQUE (student_id, skill_id)
);

COMMENT ON TABLE difficulty_decisions IS
    'AIM Engine current-state difficulty decision: one row per (student_id, skill_id). Values mirror the validated AimDifficultyDecisionOutput per P5-014 contract. This is a current-state table, not a decision-history table; full history lives in the AIM audit log.';

COMMENT ON COLUMN difficulty_decisions.id IS
    'Set equal to the AIM Engine-issued decisionId on the persisted update. Changes on every new decision for this (student_id, skill_id) pair.';

COMMENT ON COLUMN difficulty_decisions.student_id IS
    'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';

COMMENT ON COLUMN difficulty_decisions.skill_id IS
    'Skill key from the curriculum skill taxonomy. Copied from the validated AimDifficultyDecisionOutput.';

COMMENT ON COLUMN difficulty_decisions.current_difficulty IS
    'Difficulty level (1-4, locked Phase 0/1 scale) governing the student''s next presented item for this skill. The backend content-selection logic reads this column. Exclusively an AIM Engine output.';

COMMENT ON COLUMN difficulty_decisions.previous_difficulty IS
    'Difficulty level in effect immediately before the current decision, retained for audit and trend display.';

COMMENT ON COLUMN difficulty_decisions.rationale IS
    'Coarse, fixed-enum category describing why the decision was made: mastery_increase, mastery_decrease, consistent_performance, or insufficient_data_hold. Never a free-text explanation, to avoid leaking algorithm internals.';

COMMENT ON COLUMN difficulty_decisions.based_on_attempt_ids IS
    'JSONB array of attempt UUIDs that informed this decision. Copied from the validated AimDifficultyDecisionOutput on every update.';

COMMENT ON COLUMN difficulty_decisions.decided_at IS
    'When the AIM Engine made this decision, copied from the validated AimDifficultyDecisionOutput.';

COMMENT ON COLUMN difficulty_decisions.created_at IS
    'Backend-set on first persistence for this (student_id, skill_id) pair. Never updated after.';

COMMENT ON COLUMN difficulty_decisions.updated_at IS
    'Backend-set on every persistence write for this record. Maintained by the persistence service, not by clients.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX difficulty_decisions_student_id_idx
    ON difficulty_decisions (student_id);

CREATE INDEX difficulty_decisions_skill_id_idx
    ON difficulty_decisions (skill_id);

CREATE INDEX difficulty_decisions_student_id_skill_id_idx
    ON difficulty_decisions (student_id, skill_id);

CREATE INDEX difficulty_decisions_decided_at_idx
    ON difficulty_decisions (decided_at);
