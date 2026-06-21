-- P18-020: Add AI Teacher DB constraints
-- Adds foreign keys, indexes, retention metadata, and safe idempotency
-- constraints across the AI Teacher tables created in P18-011..P18-019.

-- Foreign keys deferred until referenced tables existed
ALTER TABLE ai_teacher_messages
  ADD CONSTRAINT ai_teacher_messages_prompt_template_fk
    FOREIGN KEY (prompt_template_id) REFERENCES ai_prompt_templates (id);

ALTER TABLE ai_teacher_messages
  ADD CONSTRAINT ai_teacher_messages_model_config_fk
    FOREIGN KEY (model_config_id) REFERENCES ai_model_configs (id);

ALTER TABLE ai_usage_cost_events
  ADD CONSTRAINT ai_usage_cost_events_model_config_fk
    FOREIGN KEY (model_config_id) REFERENCES ai_model_configs (id);

-- Retention metadata: bound how long conversation/message/voice content is kept
ALTER TABLE ai_teacher_conversations
  ADD COLUMN IF NOT EXISTS retain_until TIMESTAMPTZ;

ALTER TABLE ai_teacher_messages
  ADD COLUMN IF NOT EXISTS retain_until TIMESTAMPTZ;

ALTER TABLE ai_voice_sessions
  ADD COLUMN IF NOT EXISTS retain_until TIMESTAMPTZ;

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_ai_teacher_conversations_student
  ON ai_teacher_conversations (student_id);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_conversations_status
  ON ai_teacher_conversations (status);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_messages_prompt_template
  ON ai_teacher_messages (prompt_template_id);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_messages_model_config
  ON ai_teacher_messages (model_config_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_cost_events_model_config
  ON ai_usage_cost_events (model_config_id);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_status
  ON ai_prompt_templates (status);

CREATE INDEX IF NOT EXISTS idx_ai_model_configs_status
  ON ai_model_configs (status);

-- Safe idempotency: prevent duplicate active prompt templates per name
CREATE UNIQUE INDEX IF NOT EXISTS uniq_ai_prompt_templates_active_name
  ON ai_prompt_templates (name)
  WHERE status = 'active';

-- Safe idempotency: prevent duplicate active model configs per name
CREATE UNIQUE INDEX IF NOT EXISTS uniq_ai_model_configs_active_name
  ON ai_model_configs (name)
  WHERE status = 'active';
