-- P18-012: Create AI teacher messages table
-- Stores individual messages within an AI Teacher conversation. Content is
-- tutoring text only; no mastery/weakness/progress/assessment data is stored.
-- prompt_template_id and model_config_id are plain reference columns here
-- (the referenced tables are created in later migrations); foreign keys are
-- added in the AI Teacher DB constraints migration (P18-020).

CREATE TABLE IF NOT EXISTS ai_teacher_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  conversation_id UUID NOT NULL
    REFERENCES ai_teacher_conversations (id) ON DELETE CASCADE,

  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,

  prompt_template_id UUID,
  model_config_id UUID,

  redaction_status VARCHAR(20) NOT NULL DEFAULT 'none',

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ai_teacher_messages_role_check
    CHECK (role IN ('student', 'assistant', 'system')),

  CONSTRAINT ai_teacher_messages_redaction_status_check
    CHECK (redaction_status IN ('none', 'partial', 'redacted'))
);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_messages_conversation
  ON ai_teacher_messages (conversation_id);
