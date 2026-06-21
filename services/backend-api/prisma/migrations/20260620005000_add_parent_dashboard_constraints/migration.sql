-- P12-014: Add Parent Dashboard DB Constraints
-- Branch: phase12/P12-014-parent-db-constraints
-- Dependencies: P12-009..P12-013 (all parent table migrations)
-- Scope: Adds foreign keys, additional uniqueness constraints, status checks,
--        and cross-table referential integrity for parent dashboard tables.

-- Foreign key: parent_child_links.parent_id → auth.users is not added here
-- because auth.users is managed by Supabase Auth. The application layer
-- enforces this relationship.

-- Foreign key: parent_consents → parent_child_links
ALTER TABLE parent_consents
    ADD CONSTRAINT fk_parent_consents_link
    FOREIGN KEY (parent_child_link_id) REFERENCES parent_child_links(id)
    ON DELETE CASCADE;

-- Foreign key: parent_invitations.parent_id should match parent_child_links.parent_id
-- This is enforced at the application layer since invitations exist before links.

-- Constraint: parent_child_links linked_at must be set when status = active
ALTER TABLE parent_child_links
    ADD CONSTRAINT chk_parent_child_links_active_linked_at
    CHECK (status != 'active' OR linked_at IS NOT NULL);

-- Constraint: parent_child_links revoked_at must be set when status = revoked
ALTER TABLE parent_child_links
    ADD CONSTRAINT chk_parent_child_links_revoked_revoked_at
    CHECK (status != 'revoked' OR revoked_at IS NOT NULL);

-- Constraint: parent_consents revoked_at must be set when status = revoked
ALTER TABLE parent_consents
    ADD CONSTRAINT chk_parent_consents_revoked_revoked_at
    CHECK (status != 'revoked' OR revoked_at IS NOT NULL);

-- Constraint: parent_invitations accepted_at must be set when status = accepted
ALTER TABLE parent_invitations
    ADD CONSTRAINT chk_parent_invitations_accepted_accepted_at
    CHECK (status != 'accepted' OR accepted_at IS NOT NULL);

-- Constraint: parent_invitations must have child_email or child_id
ALTER TABLE parent_invitations
    ADD CONSTRAINT chk_parent_invitations_has_target
    CHECK (child_email IS NOT NULL OR child_id IS NOT NULL);

-- Constraint: parent_invitations expires_at must be in the future at creation
-- (enforced at application layer, not DB, since this is relative to insert time)

-- Additional composite indexes for common query patterns

-- Parent consents: lookup active consents by link
CREATE INDEX IF NOT EXISTS idx_parent_consents_active_by_link
    ON parent_consents (parent_child_link_id)
    WHERE status = 'granted';

-- Parent invitations: lookup pending by parent
CREATE INDEX IF NOT EXISTS idx_parent_invitations_pending_by_parent
    ON parent_invitations (parent_id)
    WHERE status = 'pending';

-- Parent access audit: recent logs (last 90 days queries)
CREATE INDEX IF NOT EXISTS idx_parent_access_audit_recent
    ON parent_access_audit_logs (created_at DESC);

-- Notification preferences: lookup enabled preferences
CREATE INDEX IF NOT EXISTS idx_parent_notif_prefs_enabled
    ON parent_notification_preferences (parent_id)
    WHERE enabled = true;
