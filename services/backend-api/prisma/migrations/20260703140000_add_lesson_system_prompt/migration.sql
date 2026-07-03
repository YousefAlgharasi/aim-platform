-- Adds an optional, admin-authored AI Teacher instruction field per lesson.
--
-- Scope:
-- AI Teacher lesson-context awareness only. Backend is the source of truth;
-- clients must not write this column directly.

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS system_prompt TEXT;

COMMENT ON COLUMN lessons.system_prompt IS
  'Optional admin-authored AI Teacher instructions specific to this lesson (what the lesson should be about, what to focus on). Injected into the AI Teacher prompt context alongside title/description when a chat session''s contextRef references this lesson. Null means no lesson-specific instructions beyond title/description.';
