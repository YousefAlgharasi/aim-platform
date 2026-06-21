-- P15-018: Create analytics_access_audit_logs table
-- Audit record of analytics/report/export access decisions.

CREATE TABLE IF NOT EXISTS analytics_access_audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role     TEXT NOT NULL CHECK (actor_role IN ('student', 'parent', 'admin', 'system')),
  action         TEXT NOT NULL CHECK (action IN ('view_dashboard', 'run_report', 'request_export', 'access_denied')),
  target_type    TEXT NOT NULL,
  target_id      UUID,
  scope          JSONB NOT NULL DEFAULT '{}',
  result         TEXT NOT NULL CHECK (result IN ('allowed', 'denied')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_access_audit_logs_actor_user_id ON analytics_access_audit_logs(actor_user_id);
CREATE INDEX idx_analytics_access_audit_logs_action ON analytics_access_audit_logs(action);
CREATE INDEX idx_analytics_access_audit_logs_target ON analytics_access_audit_logs(target_type, target_id);
CREATE INDEX idx_analytics_access_audit_logs_created_at ON analytics_access_audit_logs(created_at);
