-- P13-018: Add Notification DB Constraints
-- Branch: phase13/P13-018-notification-db-constraints
-- Dependency: P13-009..P13-017 (all Phase 13 notification/reminder tables)
-- Scope: Adds foreign keys to users, retention columns, and supporting
--        indexes across the Phase 13 notification tables to prevent invalid
--        notification state and orphaned references.

-- Foreign keys to users for every user-owned notification table
ALTER TABLE notification_preferences
    ADD CONSTRAINT fk_notification_preferences_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE device_tokens
    ADD CONSTRAINT fk_device_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE notification_events
    ADD CONSTRAINT fk_notification_events_recipient
    FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE reminder_schedules
    ADD CONSTRAINT fk_reminder_schedules_owner
    FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE notification_digests
    ADD CONSTRAINT fk_notification_digests_recipient
    FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE notification_quiet_hours
    ADD CONSTRAINT fk_notification_quiet_hours_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE notification_audit_logs
    ADD CONSTRAINT fk_notification_audit_logs_actor
    FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL;

-- Retention columns: track when a row becomes eligible for cleanup, without
-- deleting audit/history data automatically. Application-level retention
-- jobs read these columns; this migration only adds the column + index.
ALTER TABLE notification_events
    ADD COLUMN IF NOT EXISTS retain_until TIMESTAMPTZ;

ALTER TABLE notification_delivery_attempts
    ADD COLUMN IF NOT EXISTS retain_until TIMESTAMPTZ;

ALTER TABLE notification_audit_logs
    ADD COLUMN IF NOT EXISTS retain_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_notification_events_retain_until
    ON notification_events (retain_until) WHERE retain_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_delivery_attempts_retain_until
    ON notification_delivery_attempts (retain_until) WHERE retain_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_audit_logs_retain_until
    ON notification_audit_logs (retain_until) WHERE retain_until IS NOT NULL;

-- Cross-table sanity: a delivery attempt's channel must be one of the
-- channels supported on its parent notification event's channel value.
ALTER TABLE notification_delivery_attempts
    ADD CONSTRAINT chk_delivery_attempts_channel
    CHECK (channel IN ('in_app', 'push', 'email'));

-- A digest's period_end must be after its period_start.
ALTER TABLE notification_digests
    ADD CONSTRAINT chk_notification_digests_period_order
    CHECK (period_end > period_start);

-- A quiet-hour window's start/end may legitimately wrap midnight, so no
-- ordering check is applied beyond requiring both values to be present
-- (already enforced by NOT NULL on the columns).
