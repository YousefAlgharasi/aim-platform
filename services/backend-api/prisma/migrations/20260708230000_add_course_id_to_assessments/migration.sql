-- Link course-level assessments (final exams) to the course they gate, so a
-- student must complete every chapter in that course (lessons + any chapter
-- quiz, passed) before the final exam is visible or attemptable. Nullable:
-- assessments with no course_id are never gated by this check.

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_assessments_course_id
  ON assessments (course_id)
  WHERE course_id IS NOT NULL;
