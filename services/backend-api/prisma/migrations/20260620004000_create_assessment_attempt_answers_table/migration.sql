-- P10-012: Create Attempt Answers Table Migration
-- Branch: phase10/P10-012-attempt-answers-table
-- Dependency: P10-011 (Assessment Attempts Table Migration)
-- Scope: Persists a student's submitted response to a single Assessment
--        Question Link within the context of an Attempt, per the Answer
--        entity in docs/phase-10/assessment-domain-map.md (§8).
--
-- Backend authority rules (enforced at this migration layer):
--   - This table carries no correctness or score column. Grading Outcome
--     (isCorrect, pointsAwarded) is a separate backend-only concern computed
--     by the grading service, never persisted on this table and never
--     trusted from a client write path (see assessment-api-contract-map.md
--     §7 forbidden fields: isCorrect, pointsAwarded).
--   - One answer per (attempt_id, assessment_question_link_id): the unique
--     constraint below enforces duplicate-submission protection at the
--     schema layer, backing the ANSWER_ALREADY_SUBMITTED API error.
--   - response_value is opaque, learner-submitted content; format depends on
--     question type and is never interpreted as authoritative correctness.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: assessment_attempt_answers
-- ============================================================

CREATE TABLE assessment_attempt_answers (
    id                            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id                    UUID            NOT NULL REFERENCES assessment_attempts (id) ON DELETE CASCADE,
    assessment_question_link_id   UUID            NOT NULL REFERENCES assessment_questions (id) ON DELETE RESTRICT,
    response_value                TEXT            NOT NULL,
    submitted_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    created_at                    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT assessment_attempt_answers_attempt_question_unique
        UNIQUE (attempt_id, assessment_question_link_id)
);

COMMENT ON TABLE assessment_attempt_answers IS
    'Backend-owned record of a student response per docs/phase-10/assessment-domain-map.md (Answer entity). Never authoritative for correctness or score; carries no client-trusted grading field.';

COMMENT ON COLUMN assessment_attempt_answers.id IS
    'Backend-generated primary key. Referenced as answerId in API contracts.';

COMMENT ON COLUMN assessment_attempt_answers.attempt_id IS
    'Owning attempt. Cascade-deleted with the parent attempt.';

COMMENT ON COLUMN assessment_attempt_answers.assessment_question_link_id IS
    'Referenced assessment_questions row this answer responds to. RESTRICT delete to avoid silently dropping submitted answers.';

COMMENT ON COLUMN assessment_attempt_answers.response_value IS
    'Opaque learner-submitted response; format depends on question type. Never trusted as a correctness or score signal.';

COMMENT ON COLUMN assessment_attempt_answers.submitted_at IS
    'Backend-set when the answer is accepted.';

COMMENT ON COLUMN assessment_attempt_answers.created_at IS
    'Backend-set on first persistence. Never updated after.';

COMMENT ON COLUMN assessment_attempt_answers.updated_at IS
    'Backend-set on every update to this record.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX assessment_attempt_answers_attempt_id_idx
    ON assessment_attempt_answers (attempt_id);

CREATE INDEX assessment_attempt_answers_question_link_id_idx
    ON assessment_attempt_answers (assessment_question_link_id);
