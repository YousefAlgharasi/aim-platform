-- P10-011: Create Assessment Attempts Table Migration
-- Branch: phase10/P10-011-attempts-table
-- Dependency: P10-006 (Assessments Table Migration)
-- Scope: Tracks a student's attempt lifecycle for an assessment, from start
--        through submission/grading/expiry, per the Attempt entity in
--        docs/phase-10/assessment-domain-map.md (§7).
--
-- Backend authority rules (enforced at this migration layer):
--   - status transitions are backend-controlled only. This table stores the
--     resulting state; eligibility (max attempts, deadline window) and
--     lifecycle transitions are enforced by the backend attempt service,
--     not by this schema or by any client write path.
--   - student_id is backend-resolved from authenticated session context and
--     is never taken directly from a client payload.
--   - expires_at is derived server-side from assessment_settings at attempt
--     start time; it is not client-writable.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: assessment_attempts
-- ============================================================

CREATE TABLE assessment_attempts (
    id               UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id    UUID            NOT NULL REFERENCES assessments (id) ON DELETE CASCADE,
    student_id       UUID            NOT NULL,
    attempt_number   INTEGER         NOT NULL,
    status           TEXT            NOT NULL DEFAULT 'started',
    started_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    submitted_at     TIMESTAMPTZ     NULL,
    expires_at       TIMESTAMPTZ     NULL,

    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT assessment_attempts_status_check
        CHECK (status IN (
            'started',
            'in_progress',
            'submitted',
            'graded',
            'expired',
            'abandoned'
        )),

    CONSTRAINT assessment_attempts_attempt_number_positive_check
        CHECK (attempt_number > 0),

    CONSTRAINT assessment_attempts_submitted_at_after_started_check
        CHECK (submitted_at IS NULL OR submitted_at >= started_at),

    CONSTRAINT assessment_attempts_assessment_student_attempt_unique
        UNIQUE (assessment_id, student_id, attempt_number)
);

COMMENT ON TABLE assessment_attempts IS
    'Backend-owned attempt lifecycle per docs/phase-10/assessment-domain-map.md (Attempt entity). Status transitions, eligibility, and expiry are backend-controlled; this table only persists the resulting state.';

COMMENT ON COLUMN assessment_attempts.id IS
    'Backend-generated primary key. Referenced as attemptId in API contracts.';

COMMENT ON COLUMN assessment_attempts.assessment_id IS
    'Owning assessment. Cascade-deleted with the parent assessment.';

COMMENT ON COLUMN assessment_attempts.student_id IS
    'Backend-resolved student id from authenticated session context. Never taken directly from a client payload.';

COMMENT ON COLUMN assessment_attempts.attempt_number IS
    'Backend-assigned sequential attempt number per (assessment_id, student_id). Max-attempts enforcement happens in the attempt service, not via this column alone.';

COMMENT ON COLUMN assessment_attempts.status IS
    'Lifecycle state: started, in_progress, submitted, graded, expired, abandoned. Backend-controlled; no client write path may set this directly.';

COMMENT ON COLUMN assessment_attempts.started_at IS
    'Backend-set when the attempt is created.';

COMMENT ON COLUMN assessment_attempts.submitted_at IS
    'Backend-set when the attempt is submitted for grading. Null until submission.';

COMMENT ON COLUMN assessment_attempts.expires_at IS
    'Backend-derived expiry from assessment_settings.time_limit_seconds at attempt start. Not client-writable.';

COMMENT ON COLUMN assessment_attempts.created_at IS
    'Backend-set on first persistence. Never updated after.';

COMMENT ON COLUMN assessment_attempts.updated_at IS
    'Backend-set on every update to this record.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX assessment_attempts_assessment_id_idx
    ON assessment_attempts (assessment_id);

CREATE INDEX assessment_attempts_student_id_idx
    ON assessment_attempts (student_id);

CREATE INDEX assessment_attempts_assessment_id_student_id_idx
    ON assessment_attempts (assessment_id, student_id);

CREATE INDEX assessment_attempts_status_idx
    ON assessment_attempts (status);

CREATE INDEX assessment_attempts_expires_at_idx
    ON assessment_attempts (expires_at);
