-- P13-014: Create Delivery Attempts Migration
-- Branch: phase13/P13-014-delivery-attempts-migration
-- Dependency: P13-012 (Notification Events Migration)
-- Scope: Tracks channel delivery attempts, provider name (abstracted, never a
--        credential), safe error codes, and retry count. No provider secrets
--        are ever stored on this table.

CREATE TABLE IF NOT EXISTS notification_delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_event_id UUID NOT NULL REFERENCES notification_events(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'push', 'email')),
    provider TEXT NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lookup attempts for a given notification event (history/order)
CREATE INDEX idx_delivery_attempts_event
    ON notification_delivery_attempts (notification_event_id, attempt_number);

-- Lookup by status for retry/backoff processing
CREATE INDEX idx_delivery_attempts_status
    ON notification_delivery_attempts (status, created_at);
