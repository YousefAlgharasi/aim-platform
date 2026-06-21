-- P10-007: Create Assessment Sections Table Migration
-- Branch: phase10/P10-007-assessment-sections-table
-- Dependency: P10-006 (Assessments Table Migration)
-- Scope: Sections grouping questions within an assessment per the Assessment
--        Section entity in docs/phase-10/assessment-domain-map.md (§2).
--
-- Backend authority rules (enforced at this migration layer):
--   - weight is internal backend score-policy configuration. It is never
--     returned to Flutter as a scoring unit per the domain map's Flutter
--     Display Rule for this entity (display title/order for navigation only).
--   - order is informational navigation metadata, not a scoring input.
--   - No client write path may create or reorder sections.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: assessment_sections
-- ============================================================

CREATE TABLE assessment_sections (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID            NOT NULL REFERENCES assessments (id) ON DELETE CASCADE,
    title           TEXT            NOT NULL,
    "order"         INTEGER         NOT NULL,
    weight          NUMERIC(4, 3)   NOT NULL DEFAULT 1.000,

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT assessment_sections_title_not_blank_check
        CHECK (char_length(btrim(title)) > 0),

    CONSTRAINT assessment_sections_order_positive_check
        CHECK ("order" > 0),

    CONSTRAINT assessment_sections_weight_range_check
        CHECK (weight >= 0.000 AND weight <= 1.000),

    CONSTRAINT assessment_sections_assessment_order_unique
        UNIQUE (assessment_id, "order")
);

COMMENT ON TABLE assessment_sections IS
    'Backend-owned grouping of questions within an assessment per docs/phase-10/assessment-domain-map.md (Assessment Section entity). weight is internal score-policy configuration, never exposed to Flutter as a scoring unit.';

COMMENT ON COLUMN assessment_sections.id IS
    'Backend-generated primary key.';

COMMENT ON COLUMN assessment_sections.assessment_id IS
    'Owning assessment. Cascade-deleted with the parent assessment.';

COMMENT ON COLUMN assessment_sections.title IS
    'Display title shown to students and admins (e.g. "Listening", "Grammar").';

COMMENT ON COLUMN assessment_sections.order IS
    'Display/navigation order within the assessment. Not a scoring input.';

COMMENT ON COLUMN assessment_sections.weight IS
    'Internal backend score-policy weight for this section. Never returned to Flutter.';

COMMENT ON COLUMN assessment_sections.created_at IS
    'Backend-set on first persistence. Never updated after.';

COMMENT ON COLUMN assessment_sections.updated_at IS
    'Backend-set on every update to this record.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX assessment_sections_assessment_id_idx
    ON assessment_sections (assessment_id);

CREATE INDEX assessment_sections_assessment_id_order_idx
    ON assessment_sections (assessment_id, "order");
