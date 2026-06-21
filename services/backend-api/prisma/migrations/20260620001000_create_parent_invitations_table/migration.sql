-- P12-010: Create Parent Invitations Table
-- Branch: phase12/P12-010-parent-invitations-migration
-- Dependency: P12-009 (Parent Child Links Migration)
-- Scope: Creates the parent_invitations table for secure parent-child linking workflow.

CREATE TABLE IF NOT EXISTS parent_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL,
    child_email TEXT,
    child_id UUID,
    invitation_code TEXT NOT NULL,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('parent', 'guardian', 'other')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invitation codes must be unique
CREATE UNIQUE INDEX idx_parent_invitations_code_unique
    ON parent_invitations (invitation_code);

-- Prevent duplicate pending invitations from same parent to same child email
CREATE UNIQUE INDEX idx_parent_invitations_pending_unique
    ON parent_invitations (parent_id, child_email)
    WHERE status = 'pending' AND child_email IS NOT NULL;

-- Prevent duplicate pending invitations from same parent to same child id
CREATE UNIQUE INDEX idx_parent_invitations_pending_child_unique
    ON parent_invitations (parent_id, child_id)
    WHERE status = 'pending' AND child_id IS NOT NULL;

-- Lookup by parent (list own invitations)
CREATE INDEX idx_parent_invitations_parent_id
    ON parent_invitations (parent_id);

-- Lookup by status (for expiry cleanup)
CREATE INDEX idx_parent_invitations_status
    ON parent_invitations (status);

-- Lookup by expiry (for scheduled cleanup)
CREATE INDEX idx_parent_invitations_expires_at
    ON parent_invitations (expires_at)
    WHERE status = 'pending';

-- Lookup by invitation code (for acceptance flow)
CREATE INDEX idx_parent_invitations_code_lookup
    ON parent_invitations (invitation_code)
    WHERE status = 'pending';

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_parent_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_parent_invitations_updated_at
    BEFORE UPDATE ON parent_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_parent_invitations_updated_at();
