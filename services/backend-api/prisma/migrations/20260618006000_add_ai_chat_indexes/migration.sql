-- P8-024: Add AI Chat Indexes Migration
-- Branch: phase8/P8-024-ai-chat-indexes
-- Dependency: P8-018..P8-023 (AI chat sessions/messages/snapshots/provider
--             logs/safety events/feedback migrations — all Done)
-- Scope: Adds the indexes still missing for efficient AI Teacher session
--        and message reads, on top of what P8-018 and P8-019 already
--        created (student_id, status, and created_at indexes on
--        ai_chat_sessions and ai_chat_messages).
--
-- No table, column, or learning-decision data is added or changed here;
-- this migration is index-only and touches no AIM Engine-owned schema.

-- ============================================================
-- ai_chat_sessions: fast lookup of a student's active session
-- ============================================================

CREATE INDEX ai_chat_sessions_student_id_active_idx
    ON ai_chat_sessions (student_id)
    WHERE status = 'active';

-- ============================================================
-- ai_chat_sessions: list a student's sessions by recent activity
-- ============================================================

CREATE INDEX ai_chat_sessions_student_id_updated_at_idx
    ON ai_chat_sessions (student_id, updated_at DESC);

-- ============================================================
-- ai_chat_messages: efficient reverse-chronological page reads
-- ============================================================

CREATE INDEX ai_chat_messages_session_id_created_at_desc_idx
    ON ai_chat_messages (session_id, created_at DESC);
