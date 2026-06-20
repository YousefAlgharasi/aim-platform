-- P13-012: Create Notification Events Migration
-- Branch: phase13/P13-012-notification-events-migration
-- Dependency: P13-002 (Notification Domain Map)
-- Scope: Tracks the lifecycle of a single notification instance directed at a
--        recipient (scheduled, queued, sent, failed, delivered, dismissed,
--        read). Payload is privacy-safe per notification-privacy-rules.md.
--        Backend is the sole writer of `state`.

CREATE TABLE IF NOT EXISTS notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('student', 'parent')),
    template_id UUID NOT NULL REFERENCES notification_templates(id) ON DELETE RESTRICT,
    category TEXT NOT NULL CHECK (category IN (
        'learning_reminder',
        'deadline_reminder',
        'progress_update',
        'assessment_result',
        'parent_summary',
        'system_alert'
    )),
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'push', 'email')),
    payload JSONB NOT NULL DEFAULT '{}',
    state TEXT NOT NULL DEFAULT 'scheduled' CHECK (state IN (
        'scheduled', 'queued', 'sent', 'failed', 'delivered', 'dismissed', 'read'
    )),
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lookup by recipient (inbox listing)
CREATE INDEX idx_notification_events_recipient
    ON notification_events (recipient_id, created_at DESC);

-- Lookup by state for queue/worker processing
CREATE INDEX idx_notification_events_state
    ON notification_events (state, created_at);

-- Lookup by template for safe content auditing
CREATE INDEX idx_notification_events_template_id
    ON notification_events (template_id);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_notification_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notification_events_updated_at
    BEFORE UPDATE ON notification_events
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_events_updated_at();
