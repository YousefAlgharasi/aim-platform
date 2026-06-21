-- P17-021: Add post-launch DB constraints
-- Indexes for common query patterns across post-launch operations tables.

CREATE INDEX IF NOT EXISTS idx_support_tickets_requester
  ON support_tickets (requester_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON support_tickets (status);

CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_ticket
  ON support_ticket_comments (ticket_id);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user
  ON user_feedback (user_id);

CREATE INDEX IF NOT EXISTS idx_user_feedback_status
  ON user_feedback (status);

CREATE INDEX IF NOT EXISTS idx_feature_requests_status
  ON feature_requests (status);

CREATE INDEX IF NOT EXISTS idx_incident_records_status
  ON incident_records (status);

CREATE INDEX IF NOT EXISTS idx_maintenance_windows_status
  ON maintenance_windows (status);

CREATE INDEX IF NOT EXISTS idx_release_notes_status
  ON release_notes (status);

CREATE INDEX IF NOT EXISTS idx_operations_audit_actor
  ON operations_audit_logs (actor_id);

CREATE INDEX IF NOT EXISTS idx_operations_audit_resource
  ON operations_audit_logs (resource_type, resource_id);
