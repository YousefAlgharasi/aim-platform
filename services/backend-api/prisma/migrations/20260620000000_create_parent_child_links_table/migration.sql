-- P12-009: Create Parent Child Links Table
-- Branch: phase12/P12-009-parent-child-links-migration
-- Dependency: P12-002 (Parent Domain Map)
-- Scope: Creates the parent_child_links table for parent/guardian to student
--        relationships with status, relationship type, and scope.

CREATE TABLE IF NOT EXISTS parent_child_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL,
    child_id UUID NOT NULL,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('parent', 'guardian', 'other')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
    linked_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one active link per parent-child pair
CREATE UNIQUE INDEX idx_parent_child_links_active_unique
    ON parent_child_links (parent_id, child_id)
    WHERE status = 'active';

-- Lookup by parent (list children)
CREATE INDEX idx_parent_child_links_parent_id
    ON parent_child_links (parent_id);

-- Lookup by child (find parents for a student)
CREATE INDEX idx_parent_child_links_child_id
    ON parent_child_links (child_id);

-- Filter by status
CREATE INDEX idx_parent_child_links_status
    ON parent_child_links (status);

-- Composite for guard checks: parent + child + status
CREATE INDEX idx_parent_child_links_guard_check
    ON parent_child_links (parent_id, child_id, status);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_parent_child_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_parent_child_links_updated_at
    BEFORE UPDATE ON parent_child_links
    FOR EACH ROW
    EXECUTE FUNCTION update_parent_child_links_updated_at();
