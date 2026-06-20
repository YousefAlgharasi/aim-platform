-- P13-010: Create Notification Preferences Migration
-- Branch: phase13/P13-010-notification-preferences-migration
-- Dependency: P13-002 (Notification Domain Map), Phase 12 notification
--             preferences outputs (parent_notification_preferences)
-- Scope: Adds a user-level notification_preferences table covering both
--        students and parents across the full Phase 13 category set.
--        This is additive: it does not modify or replace the existing
--        Phase 12 parent_notification_preferences table, which remains in
--        use for parent-specific Phase 12 flows.

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('student', 'parent')),
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'push', 'email')),
    category TEXT NOT NULL CHECK (category IN (
        'learning_reminder',
        'deadline_reminder',
        'progress_update',
        'assessment_result',
        'parent_summary',
        'system_alert'
    )),
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One preference per user + channel + category
CREATE UNIQUE INDEX idx_notification_preferences_unique
    ON notification_preferences (user_id, channel, category);

-- Lookup by user (list all preferences for caller)
CREATE INDEX idx_notification_preferences_user_id
    ON notification_preferences (user_id);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();
