-- Link assessments to the chapter they gate, so a student must complete
-- every published lesson in that chapter before the assessment is visible
-- or attemptable. Nullable: assessments with no chapter_id are treated as
-- always unlocked (e.g. standalone practice quizzes not tied to a chapter).

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_assessments_chapter_id
  ON assessments (chapter_id)
  WHERE chapter_id IS NOT NULL;
