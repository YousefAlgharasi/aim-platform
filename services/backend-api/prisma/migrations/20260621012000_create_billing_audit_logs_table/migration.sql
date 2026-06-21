-- P14-020: Create billing audit logs table
-- Audit table for billing actions, provider events, entitlement changes, and refunds.

CREATE TABLE IF NOT EXISTS billing_audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action        TEXT NOT NULL CHECK (trim(action) <> ''),
  entity_type   TEXT NOT NULL CHECK (entity_type IN (
                  'product', 'price', 'plan', 'subscription', 'checkout_session',
                  'payment', 'invoice', 'refund', 'coupon', 'promotion_code',
                  'entitlement', 'provider_event'
                )),
  entity_id     UUID NOT NULL,
  actor_id      UUID,
  actor_type    TEXT NOT NULL CHECK (actor_type IN (
                  'user', 'system', 'provider', 'admin'
                )),
  changes       JSONB NOT NULL DEFAULT '{}',
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_audit_logs_entity_type ON billing_audit_logs(entity_type);
CREATE INDEX idx_billing_audit_logs_entity_id ON billing_audit_logs(entity_id);
CREATE INDEX idx_billing_audit_logs_actor_id ON billing_audit_logs(actor_id);
CREATE INDEX idx_billing_audit_logs_action ON billing_audit_logs(action);
CREATE INDEX idx_billing_audit_logs_created_at ON billing_audit_logs(created_at);
CREATE INDEX idx_billing_audit_logs_entity ON billing_audit_logs(entity_type, entity_id);
