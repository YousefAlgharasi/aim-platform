-- P13-017: Create Notification Audit Migration
-- Branch: phase13/P13-017-notification-audit-migration
-- Dependency: P13-012 (Notification Events Migration), P13-014 (Delivery
--             Attempts Migration)
-- Scope: Safe audit table for scheduling, preference, delivery, and token
--        events. Metadata must remain non-sensitive per
--        notification-privacy-rules.md (no notification body content,
--        provider credentials, or child personal data beyond opaque ids).

CREATE TABLE IF NOT EXISTS notification_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('student', 'parent', 'admin', 'system')),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'notification_template',
        'notification_preference',
        'device_token',
        'notification_event',
        'reminder_schedule',
        'notification_delivery_attempt',
        'notification_digest',
        'notification_quiet_hours'
    )),
    entity_id UUID NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lookup by entity for traceability of a single record's history
CREATE INDEX idx_notification_audit_logs_entity
    ON notification_audit_logs (entity_type, entity_id, created_at DESC);

-- Lookup by actor for oversight queries
CREATE INDEX idx_notification_audit_logs_actor
    ON notification_audit_logs (actor_id, created_at DESC);
