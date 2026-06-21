-- P12-011: Create Parent Consents Table
-- Branch: phase12/P12-011-parent-consents-migration
-- Dependency: P12-009 (Parent Child Links Migration)
-- Scope: Creates the parent_consents table for consent grants, revocations,
--        visibility scope, and timestamps.

CREATE TABLE IF NOT EXISTS parent_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_child_link_id UUID NOT NULL,
    consent_type TEXT NOT NULL CHECK (consent_type IN ('progress_view', 'assessment_view', 'activity_view', 'report_view', 'full_access')),
    status TEXT NOT NULL DEFAULT 'granted' CHECK (status IN ('granted', 'revoked')),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    granted_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one active consent per link + consent_type
CREATE UNIQUE INDEX idx_parent_consents_active_unique
    ON parent_consents (parent_child_link_id, consent_type)
    WHERE status = 'granted';

-- Lookup by link (check all consents for a parent-child relationship)
CREATE INDEX idx_parent_consents_link_id
    ON parent_consents (parent_child_link_id);

-- Lookup by status (for cleanup of revoked consents)
CREATE INDEX idx_parent_consents_status
    ON parent_consents (status);

-- Guard check: link + consent_type + status
CREATE INDEX idx_parent_consents_guard_check
    ON parent_consents (parent_child_link_id, consent_type, status);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_parent_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_parent_consents_updated_at
    BEFORE UPDATE ON parent_consents
    FOR EACH ROW
    EXECUTE FUNCTION update_parent_consents_updated_at();
