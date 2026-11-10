-- Structured, student-facing teaching explanation shown at the top of the lesson
-- page (overview, explained sections with examples, key points, common mistakes,
-- recap). NULL = not written yet; the lesson page then falls back to its old layout.
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS explanation JSONB;
