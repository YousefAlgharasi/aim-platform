-- P14-017: Create refunds table
-- Tracks refunds with reasons, status, amount, provider refund ID, and audit metadata.

CREATE TABLE IF NOT EXISTS refunds (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id          UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  amount              INTEGER NOT NULL CHECK (amount > 0),
  currency            TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  reason              TEXT NOT NULL CHECK (trim(reason) <> ''),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                        'pending', 'succeeded', 'failed', 'canceled', 'denied'
                      )),
  provider_refund_id  TEXT UNIQUE,
  requested_by        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by         UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_requested_by ON refunds(requested_by);
CREATE INDEX idx_refunds_provider_refund_id ON refunds(provider_refund_id);
