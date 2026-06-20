-- P13-009: Create Notification Templates Migration
-- Branch: phase13/P13-009-notification-templates-migration
-- Dependency: P13-002 (Notification Domain Map)
-- Scope: Stores reusable, locale- and channel-scoped notification templates.
--        Content is admin-authored safe metadata only -- no secrets, no raw
--        AIM output, no sensitive answers (see notification-privacy-rules.md).

CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'push', 'email')),
    locale TEXT NOT NULL CHECK (locale IN ('en', 'ar')),
    category TEXT NOT NULL CHECK (category IN (
        'learning_reminder',
        'deadline_reminder',
        'progress_update',
        'assessment_result',
        'parent_summary',
        'system_alert'
    )),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One template per key + channel + locale
CREATE UNIQUE INDEX idx_notification_templates_unique
    ON notification_templates (key, channel, locale);

-- Lookup templates by category/channel/status for active-template resolution
CREATE INDEX idx_notification_templates_category_channel_status
    ON notification_templates (category, channel, status);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_notification_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_templates_updated_at();
