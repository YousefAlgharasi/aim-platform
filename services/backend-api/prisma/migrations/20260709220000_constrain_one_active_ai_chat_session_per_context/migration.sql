-- getOrCreateForContext (AiChatSessionRepository) was SELECT-then-INSERT,
-- not atomic, so concurrent/retried calls could each miss the existing
-- active session and insert a second one — silently splitting one
-- conversation into a "new empty chat, same title" the student didn't ask
-- for. Close all but the most-recently-updated active session per
-- (student_id, context_ref) before adding the constraint that prevents
-- this going forward.
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY student_id, context_ref
           ORDER BY updated_at DESC, created_at DESC
         ) AS rn
  FROM ai_chat_sessions
  WHERE status = 'active'
)
UPDATE ai_chat_sessions
SET status = 'closed', updated_at = now()
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX ai_chat_sessions_one_active_per_context
  ON ai_chat_sessions (student_id, context_ref)
  WHERE status = 'active';
