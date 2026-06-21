-- P18-016: Create AI safety events table
-- Records moderation/safety check outcomes for AI Teacher messages and voice
-- transcript segments. Stores classification metadata only, not full raw
-- triggering content, wherever the category alone is sufficient for audit.
--
-- Named ai_teacher_safety_checks (not ai_safety_events) to avoid colliding
-- with the pre-existing ai_safety_events table (P8-018) which has a
-- different, session-based schema for the legacy AI chat pipeline.

CREATE TABLE IF NOT EXISTS ai_teacher_safety_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  target_type VARCHAR(30) NOT NULL,
  target_id UUID NOT NULL,

  category VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'low',
  action VARCHAR(20) NOT NULL,

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ai_teacher_safety_checks_target_type_check
    CHECK (target_type IN ('message', 'voice_segment')),

  CONSTRAINT ai_teacher_safety_checks_severity_check
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  CONSTRAINT ai_teacher_safety_checks_action_check
    CHECK (action IN ('allowed', 'flagged', 'blocked'))
);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_safety_checks_target
  ON ai_teacher_safety_checks (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_safety_checks_action
  ON ai_teacher_safety_checks (action);
