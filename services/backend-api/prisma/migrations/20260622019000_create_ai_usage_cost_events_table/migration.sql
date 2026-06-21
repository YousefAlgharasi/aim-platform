-- P18-017: Create AI usage and cost events table
-- Records every AI provider call's usage/cost. A row is written only after
-- a cost/quota check has passed and the provider call has completed (or
-- failed); quota state is always computed server-side from these rows.
-- model_config_id is a plain reference column here; its foreign key is
-- added in the AI Teacher DB constraints migration (P18-020).

CREATE TABLE IF NOT EXISTS ai_usage_cost_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id UUID NOT NULL
    REFERENCES users (id),

  event_type VARCHAR(30) NOT NULL,
  model_config_id UUID,

  request_id VARCHAR(100) NOT NULL,

  tokens_used INTEGER,
  duration_seconds INTEGER,
  cost_estimate NUMERIC(12, 6) NOT NULL DEFAULT 0,
  quota_period VARCHAR(20) NOT NULL DEFAULT 'daily',

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ai_usage_cost_events_event_type_check
    CHECK (event_type IN ('text_generation', 'stt', 'tts')),

  CONSTRAINT ai_usage_cost_events_quota_period_check
    CHECK (quota_period IN ('daily', 'monthly')),

  CONSTRAINT ai_usage_cost_events_request_id_unique
    UNIQUE (request_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_cost_events_student
  ON ai_usage_cost_events (student_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_cost_events_created_at
  ON ai_usage_cost_events (created_at);
