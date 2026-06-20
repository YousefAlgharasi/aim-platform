-- P12-012: Create Parent Access Audit Logs Table
-- Branch: phase12/P12-012-parent-access-audit-migration
-- Dependencies: P12-009 (Parent Child Links), P12-011 (Parent Consents)
-- Scope: Creates an append-only audit table for parent access to child data.

CREATE TABLE IF NOT EXISTS parent_access_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL,
    child_id UUID NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lookup by parent (audit trail per parent)
CREATE INDEX idx_parent_access_audit_parent_id
    ON parent_access_audit_logs (parent_id);

-- Lookup by child (audit trail per child)
CREATE INDEX idx_parent_access_audit_child_id
    ON parent_access_audit_logs (child_id);

-- Lookup by parent + child (specific relationship audit)
CREATE INDEX idx_parent_access_audit_parent_child
    ON parent_access_audit_logs (parent_id, child_id);

-- Time-based queries (compliance reporting, cleanup)
CREATE INDEX idx_parent_access_audit_created_at
    ON parent_access_audit_logs (created_at);

-- Action-based queries (filter by action type)
CREATE INDEX idx_parent_access_audit_action
    ON parent_access_audit_logs (action);
