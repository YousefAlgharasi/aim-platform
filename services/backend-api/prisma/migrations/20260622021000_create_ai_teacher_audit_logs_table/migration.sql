-- P18-019: Create AI teacher audit logs table
-- Audit trail for AI Teacher requests, prompt/model config changes, safety
-- decisions, and admin actions. Details must never include provider
-- secrets, API keys, or raw provider payloads.

CREATE TABLE IF NOT EXISTS ai_teacher_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  actor_id UUID
    REFERENCES users (id),

  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,

  details JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_audit_logs_actor
  ON ai_teacher_audit_logs (actor_id);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_audit_logs_resource
  ON ai_teacher_audit_logs (resource_type, resource_id);
