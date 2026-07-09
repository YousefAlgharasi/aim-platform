-- Backend-enforced lesson-delivery stage for ai_chat_sessions (shared by
-- the text AI Teacher and Voice Teacher, which both write to this table —
-- see VoiceSessionStartService delegating to ChatSessionStartService).
--
-- lesson_teaching_stage drives the structured teaching flow:
--   greeting  -> intro the lesson, ask "shall we start?"
--   teaching  -> explain, periodically ask a comprehension question and
--                wait for the student's reply before continuing
--   complete  -> the AI signaled [[LESSON_COMPLETE]] in its own reply text;
--                the backend parsed that marker (stripped before it ever
--                reaches the student), wrote lesson_progress.completed,
--                and flipped this column — practice unlocks from that write,
--                not from anything the client or the model claims on its own.
--
-- resolved_lesson_id is the lesson this session teaches, resolved once at
-- session start from context_ref (see CurrentLessonContextAdapter) and
-- persisted so later turns and the completion trigger never re-resolve
-- context_ref's loose "lesson:<uuid> or fall back to recommendation" format.

ALTER TABLE ai_chat_sessions
  ADD COLUMN IF NOT EXISTS lesson_teaching_stage text NOT NULL DEFAULT 'greeting',
  ADD COLUMN IF NOT EXISTS resolved_lesson_id uuid REFERENCES lessons(id);

ALTER TABLE ai_chat_sessions
  ADD CONSTRAINT ai_chat_sessions_lesson_teaching_stage_check
  CHECK (lesson_teaching_stage IN ('greeting', 'teaching', 'complete'));
