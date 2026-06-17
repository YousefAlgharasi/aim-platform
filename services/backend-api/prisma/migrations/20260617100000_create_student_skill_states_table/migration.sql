-- P5-029: Create Student Skill States Migration
-- Branch: phase5/P5-029-student-skill-states-migration
-- Dependency: P5-012 (Student Skill State Contract), P4-023 (Placement Results Migration)
-- Scope: Backend-controlled persistence for AIM Engine skill-state outputs.
--
-- Backend authority rules (enforced at this migration layer):
--   - mastery_score, mastery_confidence, and mastery_trend are exclusively
--     AIM Engine outputs. No client writes are permitted.
--   - student_id is backend-resolved from session context; clients must never
--     submit it directly to a write path against this table.
--   - One row per (student_id, skill_id). previous_mastery_score is the only
--     retained prior value (no per-evaluation history table in Phase 5).
--   - Speed and response time must never feed mastery_score, mastery_confidence,
--     or mastery_trend — those signals belong to behavioral context only.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: student_skill_states
-- ============================================================

CREATE TABLE student_skill_states (
    id                        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id                UUID            NOT NULL,
    skill_id                  TEXT            NOT NULL,

    mastery_score             NUMERIC(4, 3)   NOT NULL,
    mastery_confidence        NUMERIC(4, 3)   NOT NULL,
    mastery_trend             TEXT            NOT NULL,
    previous_mastery_score    NUMERIC(4, 3)   NULL,

    last_attempt_id           UUID            NOT NULL,
    last_evaluated_at         TIMESTAMPTZ     NOT NULL,

    created_at                TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT student_skill_states_mastery_score_range_check
        CHECK (mastery_score >= 0.000 AND mastery_score <= 1.000),

    CONSTRAINT student_skill_states_mastery_confidence_range_check
        CHECK (mastery_confidence >= 0.000 AND mastery_confidence <= 1.000),

    CONSTRAINT student_skill_states_previous_mastery_score_range_check
        CHECK (
            previous_mastery_score IS NULL
            OR (previous_mastery_score >= 0.000 AND previous_mastery_score <= 1.000)
        ),

    CONSTRAINT student_skill_states_mastery_trend_check
        CHECK (mastery_trend IN (
            'improving',
            'stable',
            'declining',
            'insufficient_data'
        )),

    CONSTRAINT student_skill_states_student_skill_unique
        UNIQUE (student_id, skill_id)
);

COMMENT ON TABLE student_skill_states IS
    'AIM Engine persisted memory: one row per (student_id, skill_id). Values mirror the validated AimSkillStateOutput per P5-012 contract.';

COMMENT ON COLUMN student_skill_states.id IS
    'Backend-generated primary key. Set on first persistence and never overwritten.';

COMMENT ON COLUMN student_skill_states.student_id IS
    'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';

COMMENT ON COLUMN student_skill_states.skill_id IS
    'Skill key from the curriculum skill taxonomy. Copied from the validated AimSkillStateOutput.';

COMMENT ON COLUMN student_skill_states.mastery_score IS
    'AIM Engine mastery estimate in the 0.000-1.000 inclusive range. Sole source of mastery; never computed elsewhere.';

COMMENT ON COLUMN student_skill_states.mastery_confidence IS
    'AIM Engine confidence in mastery_score in the 0.000-1.000 inclusive range. Descriptive context only; low confidence does not reduce mastery_score authority.';

COMMENT ON COLUMN student_skill_states.mastery_trend IS
    'Directional trend since the prior persisted state. One of improving, stable, declining, insufficient_data.';

COMMENT ON COLUMN student_skill_states.previous_mastery_score IS
    'Backend-captured snapshot of mastery_score immediately before the current update. Null on first persistence.';

COMMENT ON COLUMN student_skill_states.last_attempt_id IS
    'Attempt UUID that informed this evaluation. Copied from the validated AimSkillStateOutput.';

COMMENT ON COLUMN student_skill_states.last_evaluated_at IS
    'AIM Engine evaluation timestamp copied from the validated AimSkillStateOutput.evaluatedAt.';

COMMENT ON COLUMN student_skill_states.created_at IS
    'Backend-set on first persistence. Never updated after.';

COMMENT ON COLUMN student_skill_states.updated_at IS
    'Backend-set on every persistence write for this record. Maintained by the persistence service, not by clients.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX student_skill_states_student_id_idx
    ON student_skill_states (student_id);

CREATE INDEX student_skill_states_skill_id_idx
    ON student_skill_states (skill_id);

CREATE INDEX student_skill_states_student_id_skill_id_idx
    ON student_skill_states (student_id, skill_id);

CREATE INDEX student_skill_states_last_evaluated_at_idx
    ON student_skill_states (last_evaluated_at);

CREATE INDEX student_skill_states_mastery_trend_idx
    ON student_skill_states (mastery_trend);
