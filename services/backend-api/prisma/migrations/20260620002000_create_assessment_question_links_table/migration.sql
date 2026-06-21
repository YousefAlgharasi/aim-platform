-- P10-008: Create Assessment Question Links Table Migration
-- Branch: phase10/P10-008-assessment-question-links
-- Dependency: P10-006 (Assessments Table Migration), P3 question bank
--             (questions table, P3-026)
-- Scope: Associates question bank questions with an assessment and,
--        optionally, a section, including order and point value, per the
--        Assessment Question Link entity in
--        docs/phase-10/assessment-domain-map.md (§3).
--
-- Backend authority rules (enforced at this migration layer):
--   - points is backend-owned scoring configuration. It is never trusted
--     from a client write path and is never returned to Flutter on question
--     delivery (per assessment-api-contract-map.md §3 forbidden fields).
--   - This table does not carry the correct answer. Correctness lookup
--     happens via the existing question_choices table (is_correct), which
--     remains hidden from students until backend-approved feedback.
--   - order is display/navigation metadata, not a scoring input.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: assessment_questions
-- ============================================================

CREATE TABLE assessment_questions (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID            NOT NULL REFERENCES assessments (id) ON DELETE CASCADE,
    section_id      UUID            NULL REFERENCES assessment_sections (id) ON DELETE CASCADE,
    question_id     UUID            NOT NULL REFERENCES questions (id) ON DELETE RESTRICT,
    "order"         INTEGER         NOT NULL,
    points          NUMERIC(6, 2)   NOT NULL DEFAULT 1.00,

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT assessment_questions_order_positive_check
        CHECK ("order" > 0),

    CONSTRAINT assessment_questions_points_positive_check
        CHECK (points > 0),

    CONSTRAINT assessment_questions_assessment_order_unique
        UNIQUE (assessment_id, "order"),

    CONSTRAINT assessment_questions_assessment_question_unique
        UNIQUE (assessment_id, question_id)
);

COMMENT ON TABLE assessment_questions IS
    'Backend-owned association between a question bank question and an assessment/section per docs/phase-10/assessment-domain-map.md (Assessment Question Link entity). Carries no correct-answer data; correctness lookup remains in question_choices.';

COMMENT ON COLUMN assessment_questions.id IS
    'Backend-generated primary key. Referenced as assessmentQuestionLinkId in API contracts.';

COMMENT ON COLUMN assessment_questions.assessment_id IS
    'Owning assessment. Cascade-deleted with the parent assessment.';

COMMENT ON COLUMN assessment_questions.section_id IS
    'Optional owning section. Null means the question is not grouped into a section.';

COMMENT ON COLUMN assessment_questions.question_id IS
    'Referenced question bank item. RESTRICT delete to avoid silently dropping linked assessment content.';

COMMENT ON COLUMN assessment_questions.order IS
    'Display/navigation order within the assessment. Not a scoring input.';

COMMENT ON COLUMN assessment_questions.points IS
    'Backend-owned point value for this question within this assessment. Never trusted from a client write path; never exposed on question delivery.';

COMMENT ON COLUMN assessment_questions.created_at IS
    'Backend-set on first persistence. Never updated after.';

COMMENT ON COLUMN assessment_questions.updated_at IS
    'Backend-set on every update to this record.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX assessment_questions_assessment_id_idx
    ON assessment_questions (assessment_id);

CREATE INDEX assessment_questions_section_id_idx
    ON assessment_questions (section_id);

CREATE INDEX assessment_questions_question_id_idx
    ON assessment_questions (question_id);

CREATE INDEX assessment_questions_assessment_id_order_idx
    ON assessment_questions (assessment_id, "order");
