-- P5-039: Create Review Schedules Migration
-- Branch: phase5/P5-039-review-schedules-migration
-- Dependency: P5-016 (Review Schedule Contract)
-- Scope: Backend-controlled persistence for AIM Engine spaced-repetition outputs.
--
-- Backend authority rules (enforced at this migration layer):
--   - due_at, interval_days, repetition_count, and based_on_attempt_id are
--     exclusively AIM Engine outputs.
--   - status is backend-computed mechanically from due_at and repetition_count
--     deltas, never accepted from the AIM Engine wire output, per P5-016.
--   - One row per schedule id (current-state per active schedule, not a
--     cycle-history table; cycle closures are recorded in the AIM audit log).
--   - A repetition_count regression on update is a contract violation and
--     must be rejected by the backend persistence service before reaching
--     this table; no DB-level guard can express "compared to prior value"
--     on UPDATE without a trigger, so this is enforced at the service layer
--     per P5-016, not duplicated here.
--   - student_id is backend-resolved from session context; clients must never
--     submit it directly to a write path against this table.
--   - Speed and response time must never feed due_at, interval_days, or
--     repetition_count — those signals belong to behavioral context only.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: review_schedules
-- ============================================================

CREATE TABLE review_schedules (
    id                     UUID            PRIMARY KEY,
    student_id             UUID            NOT NULL,
    skill_id               TEXT            NOT NULL,

    due_at                 TIMESTAMPTZ     NOT NULL,
    interval_days          NUMERIC(6, 2)   NOT NULL,
    repetition_count       INTEGER         NOT NULL DEFAULT 0,
    based_on_attempt_id    UUID            NOT NULL,
    scheduled_at           TIMESTAMPTZ     NOT NULL,

    status                 TEXT            NOT NULL,

    created_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT review_schedules_interval_days_positive_check
        CHECK (interval_days > 0),

    CONSTRAINT review_schedules_repetition_count_nonneg_check
        CHECK (repetition_count >= 0),

    CONSTRAINT review_schedules_status_check
        CHECK (status IN (
            'pending',
            'due',
            'completed',
            'rescheduled'
        ))
);

COMMENT ON TABLE review_schedules IS
    'AIM Engine spaced-repetition schedule: one current row per active schedule instance (id = AIM-issued scheduleId). Values mirror the validated AimReviewScheduleOutput per P5-016 contract. Not a cycle-history table; cycle closures are recorded in the AIM audit log.';

COMMENT ON COLUMN review_schedules.id IS
    'Set equal to the AIM Engine-issued scheduleId. Stable across reschedules of the same underlying spaced-repetition item.';

COMMENT ON COLUMN review_schedules.student_id IS
    'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';

COMMENT ON COLUMN review_schedules.skill_id IS
    'Skill key from the curriculum skill taxonomy that this review schedule applies to.';

COMMENT ON COLUMN review_schedules.due_at IS
    'When this skill is next due for review, as decided by the AIM Engine. Exclusively an AIM Engine output.';

COMMENT ON COLUMN review_schedules.interval_days IS
    'Interval, in days, between the previous review and due_at. Included for transparency and audit; not independently used by the backend to recompute due_at.';

COMMENT ON COLUMN review_schedules.repetition_count IS
    'Number of successful spaced-repetition cycles completed for this schedule instance so far. A value lower than the currently stored count on an update is a contract violation rejected at the service layer.';

COMMENT ON COLUMN review_schedules.based_on_attempt_id IS
    'The most recent attempt id that triggered this scheduling decision.';

COMMENT ON COLUMN review_schedules.scheduled_at IS
    'When the AIM Engine made this scheduling decision.';

COMMENT ON COLUMN review_schedules.status IS
    'Backend-computed lifecycle status: pending, due, completed, or rescheduled. Mechanically derived from due_at and repetition_count deltas per P5-016. Never accepted from the AIM Engine wire output.';

COMMENT ON COLUMN review_schedules.created_at IS
    'Backend-set on first persistence. Never updated after.';

COMMENT ON COLUMN review_schedules.updated_at IS
    'Backend-set on every persistence write for this record, including status transitions.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX review_schedules_student_id_idx
    ON review_schedules (student_id);

CREATE INDEX review_schedules_skill_id_idx
    ON review_schedules (skill_id);

CREATE INDEX review_schedules_status_idx
    ON review_schedules (status);

CREATE INDEX review_schedules_due_at_idx
    ON review_schedules (due_at);

-- Partial index for the common "due reviews for a student" lookup used by
-- the review_practice session flow and the review_due recommendation reason.
CREATE INDEX review_schedules_due_student_idx
    ON review_schedules (student_id, due_at)
    WHERE status IN ('pending', 'due');
