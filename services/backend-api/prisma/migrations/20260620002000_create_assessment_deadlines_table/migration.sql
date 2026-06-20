-- P10-010: Create Assessment Deadlines Table
-- Branch: phase10/P10-010-deadlines-table
-- Dependency: P10-006 (assessments table on main)
-- Scope: Stores the open/close window, extended close window, timezone, and
--        late-submission policy for each assessment deadline.
--        Per docs/phase-10/assessment-domain-map.md §5 (Assessment Deadline).
--
-- Backend authority rules (enforced at this migration layer):
--   - deadline status (upcoming/open/closed/missed/late/extended/expired) is
--     NEVER stored as a raw authoritative column — it is backend-computed at
--     query time from the timestamp columns. Flutter must display the
--     backend-returned status field as-is; it must not recompute it locally.
--   - student_id IS NULL means the deadline applies to all eligible students
--     for that assessment; the backend resolves the effective deadline per
--     student at request time.
--   - late_window_seconds and late_penalty_percent are backend-evaluated
--     grading policy; they are NEVER returned to Flutter.
--   - All INSERT/UPDATE paths are backend-controlled (admin or system only);
--     Flutter has no write path into this table.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: assessment_deadlines
-- ============================================================

CREATE TABLE assessment_deadlines (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Assessment this deadline belongs to
    assessment_id           UUID            NOT NULL,

    -- NULL = applies to all students enrolled in this assessment;
    -- non-NULL = individual extension for a specific student.
    student_id              UUID            NULL,

    -- Timezone recorded for admin display and audit purposes only.
    -- The backend always evaluates deadline logic in UTC using the
    -- timestamptz columns below.
    timezone                TEXT            NOT NULL DEFAULT 'UTC',

    -- Open/close window (UTC, inclusive)
    opens_at                TIMESTAMPTZ     NOT NULL,
    closes_at               TIMESTAMPTZ     NOT NULL,

    -- Optional extension; NULL means no extension has been granted.
    -- When non-NULL the backend uses this instead of closes_at for
    -- submission eligibility and late-window calculations.
    extended_closes_at      TIMESTAMPTZ     NULL,

    -- Late-submission policy (backend-evaluated only; NEVER returned to Flutter)
    -- NULL means late submissions are not accepted.
    late_window_seconds     INTEGER         NULL,
    late_penalty_percent    NUMERIC(5, 2)   NOT NULL DEFAULT 0.00,

    -- Soft-delete / deactivation support (backend-controlled lifecycle)
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Each (assessment, student) pair may have at most one active deadline row.
    -- NULL student_id represents the global deadline; enforced via partial indexes below.
    CONSTRAINT assessment_deadlines_assessment_fk
        FOREIGN KEY (assessment_id)
        REFERENCES assessments (id)
        ON DELETE CASCADE,

    CONSTRAINT assessment_deadlines_window_order_check
        CHECK (opens_at < closes_at),

    CONSTRAINT assessment_deadlines_extended_after_close_check
        CHECK (
            extended_closes_at IS NULL
            OR extended_closes_at > closes_at
        ),

    CONSTRAINT assessment_deadlines_late_window_positive_check
        CHECK (
            late_window_seconds IS NULL
            OR late_window_seconds > 0
        ),

    CONSTRAINT assessment_deadlines_late_penalty_range_check
        CHECK (late_penalty_percent >= 0 AND late_penalty_percent <= 100),

    CONSTRAINT assessment_deadlines_timezone_not_blank_check
        CHECK (char_length(btrim(timezone)) > 0)
);

COMMENT ON TABLE assessment_deadlines IS
    'Backend-owned per-assessment (and optionally per-student) deadline windows. '
    'Status (upcoming/open/closed/missed/late/extended/expired) is backend-computed '
    'at query time and returned via GET /assessments/:id/deadline; Flutter must '
    'display it as-is without recomputing from raw timestamps. '
    'See docs/phase-10/assessment-domain-map.md §5 and assessment-authority-rules.md.';

COMMENT ON COLUMN assessment_deadlines.assessment_id IS
    'FK to assessments.id. Each deadline belongs to exactly one assessment.';

COMMENT ON COLUMN assessment_deadlines.student_id IS
    'NULL = global deadline for all enrolled students. '
    'Non-NULL = individual deadline extension for a specific student. '
    'The backend resolves the effective deadline per student at request time.';

COMMENT ON COLUMN assessment_deadlines.timezone IS
    'IANA timezone string recorded for admin display and audit purposes only. '
    'All deadline logic runs in UTC against the timestamptz columns.';

COMMENT ON COLUMN assessment_deadlines.opens_at IS
    'UTC timestamp from which the assessment window is open for attempts. '
    'Returned to Flutter as a raw timestamp for countdown display only; '
    'Flutter must not derive open/closed status from this column.';

COMMENT ON COLUMN assessment_deadlines.closes_at IS
    'UTC timestamp at which the standard submission window closes. '
    'Returned to Flutter for countdown display only; see opens_at rule.';

COMMENT ON COLUMN assessment_deadlines.extended_closes_at IS
    'UTC timestamp of an admin-granted extension. When non-NULL the backend '
    'uses this instead of closes_at for eligibility and late-window checks. '
    'Returned to Flutter as a raw timestamp only; status derivation is backend-only.';

COMMENT ON COLUMN assessment_deadlines.late_window_seconds IS
    'Seconds after the effective close (closes_at or extended_closes_at) during '
    'which late submissions are still accepted. NULL = no late submissions. '
    'Backend-evaluated only; NEVER returned to Flutter.';

COMMENT ON COLUMN assessment_deadlines.late_penalty_percent IS
    'Score deduction applied to submissions within the late window (0–100). '
    'Backend-applied during grading. NEVER returned to Flutter.';

COMMENT ON COLUMN assessment_deadlines.is_active IS
    'FALSE = this deadline row has been superseded or deactivated by the backend. '
    'Inactive rows are excluded from student-facing queries.';

-- ============================================================
-- Indexes
-- ============================================================

-- Primary lookup: effective deadline for an assessment (global, active)
CREATE UNIQUE INDEX assessment_deadlines_global_unique_idx
    ON assessment_deadlines (assessment_id)
    WHERE student_id IS NULL AND is_active = TRUE;

-- Primary lookup: per-student deadline extension
CREATE UNIQUE INDEX assessment_deadlines_per_student_unique_idx
    ON assessment_deadlines (assessment_id, student_id)
    WHERE student_id IS NOT NULL AND is_active = TRUE;

-- Backend query: find all deadlines currently open (for scheduled jobs / API queries)
CREATE INDEX assessment_deadlines_window_idx
    ON assessment_deadlines (opens_at, closes_at)
    WHERE is_active = TRUE;

-- Backend query: look up all deadlines for a given assessment
CREATE INDEX assessment_deadlines_assessment_id_idx
    ON assessment_deadlines (assessment_id);

-- Backend query: look up per-student deadline extension by student
CREATE INDEX assessment_deadlines_student_id_idx
    ON assessment_deadlines (student_id)
    WHERE student_id IS NOT NULL;
