-- P10-014: Create Result Breakdown Table Migration
-- Branch: phase10/P10-014-result-breakdown-table
-- Dependency: P10-013 (Assessment Results Table Migration)
-- Scope: Per-section/per-question detail belonging to a Result, used for
--        review/feedback display and analytics, per the Result Breakdown
--        entity in docs/phase-10/assessment-domain-map.md (§11).
--
-- Backend authority rules (enforced at this migration layer):
--   - is_correct is nullable by design: it is populated only when the
--     backend's feedback policy has approved post-result feedback for the
--     assessment (per assessment-api-contract-map.md §10). The API layer,
--     not this schema, decides when to omit the value from a response.
--   - points_awarded and points_possible are backend grading service
--     outputs only; never client-writable.
--   - This table never carries the correct answer itself, only the
--     correctness/points result for the student's own submitted answer.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: assessment_result_breakdowns
-- ============================================================

CREATE TABLE assessment_result_breakdowns (
    id                            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id                    UUID            NOT NULL REFERENCES assessment_results (id) ON DELETE CASCADE,
    section_id                   UUID            NULL REFERENCES assessment_sections (id) ON DELETE SET NULL,
    assessment_question_link_id  UUID            NULL REFERENCES assessment_questions (id) ON DELETE SET NULL,
    is_correct                   BOOLEAN         NULL,
    points_awarded               NUMERIC(6, 2)   NOT NULL,
    points_possible              NUMERIC(6, 2)   NOT NULL,

    created_at                   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT assessment_result_breakdowns_points_awarded_range_check
        CHECK (points_awarded >= 0 AND points_awarded <= points_possible),

    CONSTRAINT assessment_result_breakdowns_points_possible_positive_check
        CHECK (points_possible > 0)
);

COMMENT ON TABLE assessment_result_breakdowns IS
    'Backend-owned per-section/per-question result detail per docs/phase-10/assessment-domain-map.md (Result Breakdown entity). is_correct is populated only when backend-approved post-result feedback applies.';

COMMENT ON COLUMN assessment_result_breakdowns.id IS
    'Backend-generated primary key.';

COMMENT ON COLUMN assessment_result_breakdowns.result_id IS
    'Owning result. Cascade-deleted with the parent result.';

COMMENT ON COLUMN assessment_result_breakdowns.section_id IS
    'Optional related section. Nulled if the section is later removed; the breakdown row is retained for analytics.';

COMMENT ON COLUMN assessment_result_breakdowns.assessment_question_link_id IS
    'Optional related question link. Nulled if the question link is later removed; the breakdown row is retained for analytics.';

COMMENT ON COLUMN assessment_result_breakdowns.is_correct IS
    'Backend grading service output. Null unless the assessment feedback policy explicitly approves post-result feedback; never set or overridden by a client.';

COMMENT ON COLUMN assessment_result_breakdowns.points_awarded IS
    'Backend grading service output. Never client-writable.';

COMMENT ON COLUMN assessment_result_breakdowns.points_possible IS
    'Backend grading service output. Never client-writable.';

COMMENT ON COLUMN assessment_result_breakdowns.created_at IS
    'Backend-set on first persistence. Never updated after.';

COMMENT ON COLUMN assessment_result_breakdowns.updated_at IS
    'Backend-set on every update to this record.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX assessment_result_breakdowns_result_id_idx
    ON assessment_result_breakdowns (result_id);

CREATE INDEX assessment_result_breakdowns_section_id_idx
    ON assessment_result_breakdowns (section_id);

CREATE INDEX assessment_result_breakdowns_question_link_id_idx
    ON assessment_result_breakdowns (assessment_question_link_id);
