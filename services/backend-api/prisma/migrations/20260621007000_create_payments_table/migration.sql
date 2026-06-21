-- P14-015: Create payments table
-- Tracks payment records without storing raw card data.

CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkout_session_id   UUID REFERENCES checkout_sessions(id) ON DELETE SET NULL,
  subscription_id       UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount                INTEGER NOT NULL CHECK (amount >= 0),
  currency              TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                          'pending', 'succeeded', 'failed',
                          'refunded', 'partially_refunded'
                        )),
  provider_payment_id   TEXT UNIQUE,
  payment_method_type   TEXT CHECK (payment_method_type IN (
                          'card', 'bank_transfer', 'wallet', 'other'
                        )),
  metadata              JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_checkout_session_id ON payments(checkout_session_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_payment_id ON payments(provider_payment_id);
