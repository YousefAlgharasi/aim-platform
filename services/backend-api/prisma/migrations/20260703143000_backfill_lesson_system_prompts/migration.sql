-- Backfills lessons.system_prompt (added in 20260703140000_add_lesson_system_prompt)
-- for every existing lesson that doesn't have one yet, so the AI Teacher's
-- lesson-context injection can be tested end-to-end without manually
-- authoring one per lesson first.
--
-- The generated instruction explicitly names the lesson title and asks the
-- AI Teacher to mention it back, so a tester can verify the prompt actually
-- points at the specific lesson being viewed (not just a generic reply).

UPDATE lessons
SET system_prompt = format(
  'This AI Teacher chat is about the lesson "%s". %s ' ||
  'Keep every explanation, example, and practice question specifically about this lesson''s topic. ' ||
  'When you reply, mention the lesson title "%s" naturally at least once so the student can tell you know exactly which lesson they are studying. ' ||
  'If the student asks something unrelated to this topic, gently steer the conversation back to "%s".',
  title, description, title, title
)
WHERE system_prompt IS NULL;
