-- P13-013: Create Reminder Schedules Migration
-- Branch: phase13/P13-013-reminder-schedules-migration
-- Dependency: P13-002 (Notification Domain Map)
-- Scope: Persists backend-controlled reminder plans for learning plans,
--        review/spaced-repetition, deadlines, streaks, and custom reminders.
--        `next_run_at` and `status` are backend-owned; a client may only
--        request creation of a custom reminder.

CREATE TABLE IF NOT EXISTS reminder_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    owner_type TEXT NOT NULL CHECK (owner_type IN ('student', 'parent')),
    kind TEXT NOT NULL CHECK (kind IN ('learning_plan', 'review', 'deadline', 'streak', 'custom')),
    cadence TEXT NOT NULL,
    next_run_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lookup by owner (list caller's own reminder schedules)
CREATE INDEX idx_reminder_schedules_owner
    ON reminder_schedules (owner_id, status);

-- Lookup by due time for the scheduler to find runnable reminders
CREATE INDEX idx_reminder_schedules_next_run
    ON reminder_schedules (status, next_run_at);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_reminder_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reminder_schedules_updated_at
    BEFORE UPDATE ON reminder_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_reminder_schedules_updated_at();
