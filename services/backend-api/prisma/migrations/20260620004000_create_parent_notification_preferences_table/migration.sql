-- P12-013: Create Parent Notification Preferences Table
-- Branch: phase12/P12-013-parent-notification-preferences-migration
-- Dependency: P12-009 (Parent Child Links Migration)
-- Scope: Creates the parent_notification_preferences table for future Phase 13
--        integration. Stores preferences only — no notification sending.

CREATE TABLE IF NOT EXISTS parent_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
    category TEXT NOT NULL CHECK (category IN ('progress_update', 'assessment_result', 'deadline_reminder', 'weekly_summary', 'system_alert')),
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One preference per parent + channel + category
CREATE UNIQUE INDEX idx_parent_notif_prefs_unique
    ON parent_notification_preferences (parent_id, channel, category);

-- Lookup by parent (list all preferences)
CREATE INDEX idx_parent_notif_prefs_parent_id
    ON parent_notification_preferences (parent_id);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_parent_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_parent_notification_preferences_updated_at
    BEFORE UPDATE ON parent_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_parent_notification_preferences_updated_at();
