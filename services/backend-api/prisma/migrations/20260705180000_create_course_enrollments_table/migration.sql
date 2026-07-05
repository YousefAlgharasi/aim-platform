-- Create Course Enrollments Migration
-- Scope: Backend-owned "which course is this student currently in" record.
--
-- Why this exists:
--   Before this table, there was no way to answer "what course is this
--   student enrolled in" at all — lesson_progress rows only exist once a
--   student has already opened a specific lesson, and there was no
--   course-level concept of "current"/"active" course, nor any explicit
--   start action.
--
-- Backend authority rules:
--   - student_id is backend-resolved from the authenticated session context;
--     clients never submit it directly.
--   - course_id must reference a real, published course.
--   - A student has at most one active (status = 'active') enrollment at a
--     time, enforced by the partial unique index below. Starting a new
--     course transitions the previous active enrollment to 'switched'
--     rather than deleting it, preserving enrollment history.

CREATE TABLE course_enrollments (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID            NOT NULL,
    course_id       UUID            NOT NULL REFERENCES courses (id),

    status          TEXT            NOT NULL DEFAULT 'active',

    enrolled_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT course_enrollments_status_check
        CHECK (status IN ('active', 'switched'))
);

COMMENT ON TABLE course_enrollments IS
    'Backend-owned record of which course a student is currently enrolled in. At most one active row per student — see course_enrollments_one_active_per_student_idx.';

COMMENT ON COLUMN course_enrollments.student_id IS
    'Backend-resolved student id from authenticated session context. Never taken from a client payload.';

COMMENT ON COLUMN course_enrollments.status IS
    'active = the student''s current course. switched = a prior enrollment replaced when the student started a different course.';

-- Enforce "one active course at a time": a partial unique index means at
-- most one row per student_id can have status = 'active'.
CREATE UNIQUE INDEX course_enrollments_one_active_per_student_idx
    ON course_enrollments (student_id)
    WHERE status = 'active';

CREATE INDEX course_enrollments_student_id_idx
    ON course_enrollments (student_id);

CREATE INDEX course_enrollments_course_id_idx
    ON course_enrollments (course_id);

-- No policies defined (deny-by-default for the anon/authenticated Supabase
-- roles reached via PostgREST) — matches every other backend-owned table's
-- posture (see 20260617110000_apply_foundation_rls_policies). The backend
-- API connects via a direct Postgres role that bypasses RLS.
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
