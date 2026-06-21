-- P18-011: Create AI teacher conversations table
-- Tracks AI Teacher tutoring conversation sessions. AI Teacher is a tutoring
-- assistant only; this table stores no mastery, weakness, difficulty,
-- recommendation, progress, or assessment data.

CREATE TABLE IF NOT EXISTS ai_teacher_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id UUID NOT NULL
    REFERENCES users (id),

  scope VARCHAR(100) NOT NULL DEFAULT 'general',
  mode VARCHAR(20) NOT NULL DEFAULT 'text',
  status VARCHAR(20) NOT NULL DEFAULT 'active',

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ai_teacher_conversations_mode_check
    CHECK (mode IN ('text', 'voice')),

  CONSTRAINT ai_teacher_conversations_status_check
    CHECK (status IN ('active', 'archived', 'blocked'))
);

CREATE OR REPLACE FUNCTION set_ai_teacher_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_teacher_conversations_set_updated_at ON ai_teacher_conversations;

CREATE TRIGGER ai_teacher_conversations_set_updated_at
BEFORE UPDATE ON ai_teacher_conversations
FOR EACH ROW
EXECUTE FUNCTION set_ai_teacher_conversations_updated_at();
