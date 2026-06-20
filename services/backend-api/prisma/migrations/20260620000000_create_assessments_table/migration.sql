-- P10-006: Create Assessments Table Migration
-- Branch: phase10/P10-006-assessments-table-migration
-- Dependency: P10-002 (Assessment Domain Map)
-- Scope: Base table for quiz/exam definitions per the Assessment entity in
--        docs/phase-10/assessment-domain-map.md (§1).
--
-- Backend authority rules (enforced at this migration layer):
--   - This table holds only the Assessment definition itself. It carries no
--     grading, scoring, deadline, or attempt-state columns — those belong to
--     their own tables owned by other backend services (Phase 10 P10-007+).
--   - status transitions (draft/published/archived) are backend-controlled;
--     no client-writable authority field is introduced here.
--   - created_by is backend-resolved from authenticated admin/session context,
--     never taken directly from an unauthenticated client payload.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: assessments
-- ============================================================

CREATE TABLE assessments (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    type          TEXT            NOT NULL,
    title         TEXT            NOT NULL,
    description   TEXT            NULL,
    status        TEXT            NOT NULL DEFAULT 'draft',
    created_by    UUID            NOT NULL,

    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT assessments_type_check
        CHECK (type IN ('quiz', 'exam')),

    CONSTRAINT assessments_status_check
        CHECK (status IN ('draft', 'published', 'archived')),

    CONSTRAINT assessments_title_not_blank_check
        CHECK (char_length(btrim(title)) > 0)
);

COMMENT ON TABLE assessments IS
    'Backend-owned quiz/exam definition per docs/phase-10/assessment-domain-map.md (Assessment entity). Grading, scoring, deadline, and attempt state are owned by separate tables.';

COMMENT ON COLUMN assessments.id IS
    'Backend-generated primary key.';

COMMENT ON COLUMN assessments.type IS
    'Assessment kind: quiz or exam.';

COMMENT ON COLUMN assessments.title IS
    'Display title shown to students and admins.';

COMMENT ON COLUMN assessments.description IS
    'Optional display description shown to students and admins.';

COMMENT ON COLUMN assessments.status IS
    'Lifecycle state: draft, published, or archived. Backend-controlled; no client write path may set this directly without admin authorization.';

COMMENT ON COLUMN assessments.created_by IS
    'Backend-resolved id of the admin/staff user who created this assessment. Never taken directly from an unauthenticated client payload.';

COMMENT ON COLUMN assessments.created_at IS
    'Backend-set on first persistence. Never updated after.';

COMMENT ON COLUMN assessments.updated_at IS
    'Backend-set on every update to this record.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX assessments_type_idx
    ON assessments (type);

CREATE INDEX assessments_status_idx
    ON assessments (status);

CREATE INDEX assessments_created_by_idx
    ON assessments (created_by);

CREATE INDEX assessments_status_type_idx
    ON assessments (status, type);
