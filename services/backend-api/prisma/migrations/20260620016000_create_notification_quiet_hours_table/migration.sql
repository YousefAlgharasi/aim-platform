-- P13-016: Create Quiet Hours Migration
-- Branch: phase13/P13-016-quiet-hours-migration
-- Dependency: P13-010 (Notification Preferences Migration)
-- Scope: Stores per-user quiet-hour windows for student and parent accounts.
--        The backend evaluates this window at dispatch time; client display
--        of this data is read-only authority-wise (client may submit a
--        requested window, backend validates and owns enforcement).

CREATE TABLE IF NOT EXISTS notification_quiet_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('student', 'parent')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One quiet-hour window per user
CREATE UNIQUE INDEX idx_notification_quiet_hours_user_unique
    ON notification_quiet_hours (user_id);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_notification_quiet_hours_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notification_quiet_hours_updated_at
    BEFORE UPDATE ON notification_quiet_hours
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_quiet_hours_updated_at();
