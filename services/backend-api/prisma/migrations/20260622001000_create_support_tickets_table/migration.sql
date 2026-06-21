-- P17-011: Create support tickets table
-- Tracks user-submitted support tickets with category, severity, and status.

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  requester_id UUID NOT NULL
    REFERENCES users (id),

  category VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open',

  assigned_to UUID
    REFERENCES users (id),

  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT support_tickets_category_check
    CHECK (category IN ('bug_report', 'account_issue', 'learning_issue', 'billing_issue', 'general', 'other')),

  CONSTRAINT support_tickets_severity_check
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  CONSTRAINT support_tickets_status_check
    CHECK (status IN ('open', 'in_progress', 'waiting_on_user', 'resolved', 'closed'))
);

CREATE OR REPLACE FUNCTION set_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS support_tickets_set_updated_at ON support_tickets;

CREATE TRIGGER support_tickets_set_updated_at
BEFORE UPDATE ON support_tickets
FOR EACH ROW
EXECUTE FUNCTION set_support_tickets_updated_at();
