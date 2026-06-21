-- P13-015: Create Notification Digests Migration
-- Branch: phase13/P13-015-notification-digests-migration
-- Dependency: P13-012 (Notification Events Migration)
-- Scope: Stores grouped daily/weekly digest records referencing existing
--        notification events, to avoid re-notifying users individually for
--        every grouped item.

CREATE TABLE IF NOT EXISTS notification_digests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('student', 'parent')),
    period TEXT NOT NULL CHECK (period IN ('daily', 'weekly')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    event_ids UUID[] NOT NULL DEFAULT '{}',
    state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'sent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lookup by recipient (list caller's digests)
CREATE INDEX idx_notification_digests_recipient
    ON notification_digests (recipient_id, period_start DESC);

-- Prevent duplicate digests for the same recipient/period window
CREATE UNIQUE INDEX idx_notification_digests_unique_period
    ON notification_digests (recipient_id, period, period_start);

-- Lookup by state for digest dispatch worker
CREATE INDEX idx_notification_digests_state
    ON notification_digests (state, period_end);
