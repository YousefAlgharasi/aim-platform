-- P17-020: Create operations audit logs table
-- Audit trail for all post-launch operations resource changes.

CREATE TABLE IF NOT EXISTS operations_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  actor_id UUID NOT NULL
    REFERENCES users (id),

  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,

  details JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT operations_audit_logs_resource_type_check
    CHECK (resource_type IN (
      'support_ticket',
      'feedback',
      'feature_request',
      'incident',
      'maintenance_window',
      'release_note',
      'operational_status',
      'feature_flag'
    ))
);
