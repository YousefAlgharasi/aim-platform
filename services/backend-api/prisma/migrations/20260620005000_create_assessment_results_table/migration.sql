-- P10-013: Create Assessment Results Table Migration
-- Branch: phase10/P10-013-results-table
-- Dependency: P10-011 (Assessment Attempts Table Migration)
-- Scope: Persists the backend-persisted outcome of a completed (graded)
--        Attempt: score, pass/fail, late-penalty flag, and grading
--        timestamp, per the Result entity in
--        docs/phase-10/assessment-domain-map.md (§10).
--
-- Backend authority rules (enforced at this migration layer):
--   - score, max_score, passed, and late_penalty_applied are written
--     exclusively by the backend grading/score-policy service. No client
--     write path may set or override these values.
--   - One result per attempt: the unique constraint on attempt_id enforces
--     that a Result is never duplicated or recomputed client-side for the
--     same attempt.
--   - This table is the sole source of truth for pass/fail; pass_threshold
--     itself remains internal configuration on assessment_settings and is
--     not duplicated here.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: assessment_results
-- ============================================================

CREATE TABLE assessment_results (
    id                       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id               UUID            NOT NULL REFERENCES assessment_attempts (id) ON DELETE CASCADE,
    assessment_id            UUID            NOT NULL REFERENCES assessments (id) ON DELETE CASCADE,
    student_id               UUID            NOT NULL,
    score                    NUMERIC(7, 2)   NOT NULL,
    max_score                NUMERIC(7, 2)   NOT NULL,
    passed                   BOOLEAN         NOT NULL,
    late_penalty_applied     BOOLEAN         NOT NULL DEFAULT FALSE,
    graded_at                TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    created_at               TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT assessment_results_score_range_check
        CHECK (score >= 0 AND score <= max_score),

    CONSTRAINT assessment_results_max_score_positive_check
        CHECK (max_score > 0),

    CONSTRAINT assessment_results_attempt_unique
        UNIQUE (attempt_id)
);

COMMENT ON TABLE assessment_results IS
    'Backend-owned authoritative result per docs/phase-10/assessment-domain-map.md (Result entity). Written exclusively by the grading/score-policy service; never client-writable or recomputable.';

COMMENT ON COLUMN assessment_results.id IS
    'Backend-generated primary key. Referenced as resultId in API contracts.';

COMMENT ON COLUMN assessment_results.attempt_id IS
    'The graded attempt this result belongs to. One result per attempt, enforced by unique constraint.';

COMMENT ON COLUMN assessment_results.assessment_id IS
    'Owning assessment, denormalized for result-history query efficiency.';

COMMENT ON COLUMN assessment_results.student_id IS
    'Backend-resolved student id, preserved for ownership checks on result and result-history reads.';

COMMENT ON COLUMN assessment_results.score IS
    'Backend grading/score-policy output. Never client-writable.';

COMMENT ON COLUMN assessment_results.max_score IS
    'Backend grading/score-policy output. Never client-writable.';

COMMENT ON COLUMN assessment_results.passed IS
    'Backend score-policy pass/fail determination. Never recomputed or overridden by Flutter.';

COMMENT ON COLUMN assessment_results.late_penalty_applied IS
    'Backend score-policy flag indicating a late-submission penalty was applied to score. Never client-writable.';

COMMENT ON COLUMN assessment_results.graded_at IS
    'Backend-set when grading completes.';

COMMENT ON COLUMN assessment_results.created_at IS
    'Backend-set on first persistence. Never updated after.';

COMMENT ON COLUMN assessment_results.updated_at IS
    'Backend-set on every update to this record (e.g. manual regrade by backend service only).';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX assessment_results_attempt_id_idx
    ON assessment_results (attempt_id);

CREATE INDEX assessment_results_assessment_id_idx
    ON assessment_results (assessment_id);

CREATE INDEX assessment_results_student_id_idx
    ON assessment_results (student_id);

CREATE INDEX assessment_results_student_id_assessment_id_idx
    ON assessment_results (student_id, assessment_id);

CREATE INDEX assessment_results_graded_at_idx
    ON assessment_results (graded_at);
