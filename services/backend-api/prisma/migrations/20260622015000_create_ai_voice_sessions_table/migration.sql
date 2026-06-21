-- P18-013: Create AI voice sessions table
-- Tracks voice tutor session metadata only. Raw audio is never persisted;
-- transcript_ref points to transcript segments stored elsewhere. Provider
-- metadata is non-secret (provider label/model only, never keys).

CREATE TABLE IF NOT EXISTS ai_voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id UUID NOT NULL
    REFERENCES users (id),

  conversation_id UUID
    REFERENCES ai_teacher_conversations (id) ON DELETE SET NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'active',
  duration_seconds INTEGER NOT NULL DEFAULT 0,

  provider_metadata JSONB NOT NULL DEFAULT '{}',
  transcript_ref VARCHAR(255),

  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,

  CONSTRAINT ai_voice_sessions_status_check
    CHECK (status IN ('active', 'completed', 'blocked', 'expired')),

  CONSTRAINT ai_voice_sessions_duration_non_negative
    CHECK (duration_seconds >= 0)
);

CREATE INDEX IF NOT EXISTS idx_ai_voice_sessions_student
  ON ai_voice_sessions (student_id);

CREATE INDEX IF NOT EXISTS idx_ai_voice_sessions_conversation
  ON ai_voice_sessions (conversation_id);
