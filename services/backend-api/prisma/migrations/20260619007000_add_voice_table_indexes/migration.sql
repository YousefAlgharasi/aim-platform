-- P9-025: Add Voice Table Indexes
-- Branch: phase9/P9-025-voice-indexes
-- Dependency: P9-018..P9-024 (All voice table migrations — Done)
-- Scope: Adds supplementary indexes to all voice tables for efficient
--        common read/write patterns in AI Teacher Voice Mode — on top of
--        the inline indexes already created by each table migration.
--        Covers active-session lookups, reverse-chronological message
--        reads, cross-table observability joins, and lifecycle-status
--        filters used by the NestJS backend voice controller and workers.
--
-- Mirrors the Phase 8 add_ai_chat_indexes pattern (P8-024) adapted for
-- the full voice table set: voice_sessions, voice_messages,
-- voice_audio_assets, voice_provider_logs, voice_transcripts,
-- voice_safety_events, and voice_feedback.
--
-- No table, column, or learning-decision data is added or changed here;
-- this migration is index-only and touches no AIM Engine-owned schema.
-- No STT/TTS/AI provider keys or secrets are stored.

-- ============================================================
-- voice_sessions: fast active-session lookup for a student
-- (Supplements: voice_sessions_student_id_status_idx)
-- ============================================================

CREATE INDEX voice_sessions_student_id_active_idx
    ON voice_sessions (student_id)
    WHERE status = 'active';

-- voice_sessions: list a student's sessions by recency for history view
CREATE INDEX voice_sessions_student_id_updated_at_idx
    ON voice_sessions (student_id, updated_at DESC);

-- ============================================================
-- voice_messages: reverse-chronological read for session history
-- (Supplements: voice_messages_session_id_created_at_idx which is ASC)
-- ============================================================

CREATE INDEX voice_messages_session_id_created_at_desc_idx
    ON voice_messages (session_id, created_at DESC);

-- voice_messages: find pending/failed turns quickly for retry workers
CREATE INDEX voice_messages_status_created_at_idx
    ON voice_messages (status, created_at ASC)
    WHERE status IN ('pending', 'failed');

-- ============================================================
-- voice_audio_assets: look up all assets for a session
-- (Supplements: voice_audio_assets_student_id_created_at_idx)
-- ============================================================

CREATE INDEX voice_audio_assets_session_id_created_at_idx
    ON voice_audio_assets (session_id, created_at DESC);

-- voice_audio_assets: look up the asset for a specific turn
CREATE INDEX voice_audio_assets_message_id_idx
    ON voice_audio_assets (message_id)
    WHERE message_id IS NOT NULL;

-- ============================================================
-- voice_provider_logs: filter by session for observability dashboards
-- (Supplements: voice_provider_logs_message_id_created_at_idx)
-- ============================================================

CREATE INDEX voice_provider_logs_session_id_created_at_idx
    ON voice_provider_logs (session_id, created_at DESC);

-- voice_provider_logs: find failed provider calls for alerting/retry
CREATE INDEX voice_provider_logs_status_provider_type_idx
    ON voice_provider_logs (status, provider_type)
    WHERE status = 'failed';

-- ============================================================
-- voice_transcripts: look up transcript for a specific message
-- (UNIQUE constraint covers message_id equality; this speeds range
--  queries joining transcripts → messages within a session)
-- ============================================================

CREATE INDEX voice_transcripts_session_id_message_id_idx
    ON voice_transcripts (session_id, message_id);

-- voice_transcripts: filter by confidence band for quality analytics
-- Only index rows where confidence was recorded (non-NULL)
CREATE INDEX voice_transcripts_confidence_idx
    ON voice_transcripts (confidence)
    WHERE confidence IS NOT NULL;

-- ============================================================
-- voice_safety_events: filter to rejected events for audit
-- (Supplements: voice_safety_events_decision_idx)
-- ============================================================

CREATE INDEX voice_safety_events_session_id_rejected_idx
    ON voice_safety_events (session_id, created_at DESC)
    WHERE decision = 'rejected';

-- ============================================================
-- voice_feedback: look up ratings for a session in order
-- (Supplements: voice_feedback_session_id_created_at_idx)
-- ============================================================

CREATE INDEX voice_feedback_session_id_rating_idx
    ON voice_feedback (session_id, rating);
