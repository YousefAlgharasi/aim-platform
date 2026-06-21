-- P18-016: Create AI safety events table
-- Records moderation/safety check outcomes for AI Teacher messages and voice
-- transcript segments. Stores classification metadata only, not full raw
-- triggering content, wherever the category alone is sufficient for audit.

CREATE TABLE IF NOT EXISTS ai_safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  target_type VARCHAR(30) NOT NULL,
  target_id UUID NOT NULL,

  category VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'low',
  action VARCHAR(20) NOT NULL,

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ai_safety_events_target_type_check
    CHECK (target_type IN ('message', 'voice_segment')),

  CONSTRAINT ai_safety_events_severity_check
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  CONSTRAINT ai_safety_events_action_check
    CHECK (action IN ('allowed', 'flagged', 'blocked'))
);

CREATE INDEX IF NOT EXISTS idx_ai_safety_events_target
  ON ai_safety_events (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_ai_safety_events_action
  ON ai_safety_events (action);
