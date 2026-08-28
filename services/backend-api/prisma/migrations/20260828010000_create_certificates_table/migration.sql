-- Create certificates table.
--
-- Scope: Admin-visible record that a student completed a course, with a
-- snapshot of their quiz/exam results for that course at the time of
-- issuance. Course completion itself is still decided exclusively by
-- CourseCompletionService (every published lesson in the course completed);
-- this table only records the fact and the score snapshot once that's true.
--
-- Backend authority rules:
--   - student_id and course_id are backend-resolved; never client-writable.
--   - score_snapshot is a point-in-time copy of assessment results, taken at
--     issuance, so a certificate's shown scores don't silently change if an
--     assessment result is later corrected — it is a certificate, not a
--     live report.
--   - At most one certificate per (student_id, course_id) — re-completing
--     (e.g. after a reset) does not issue a duplicate.

CREATE TABLE IF NOT EXISTS certificates (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id        UUID          NOT NULL,
  course_id         UUID          NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  issued_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- Point-in-time snapshot of this course's quiz/exam results at issuance:
  -- [{ assessmentId, title, type, score, maxScore, passed }, ...]
  score_snapshot    JSONB         NOT NULL DEFAULT '[]',

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT certificates_student_course_unique UNIQUE (student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates (student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates (course_id);

COMMENT ON TABLE certificates IS
  'Backend-issued record that a student completed a course, with a score snapshot taken at issuance. Never client-writable.';

-- No RLS policies defined (deny-by-default for anon/authenticated Supabase
-- roles reached via PostgREST) — matches every other backend-owned table's
-- posture (see 20260617110000_apply_foundation_rls_policies). The backend
-- API connects via a direct Postgres role that bypasses RLS.
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
