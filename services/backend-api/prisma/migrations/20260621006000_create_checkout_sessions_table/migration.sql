-- P14-014: Create checkout sessions table
-- Tracks checkout sessions, provider session IDs, status, and expiry.

CREATE TABLE IF NOT EXISTS checkout_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price_id            UUID NOT NULL REFERENCES billing_prices(id) ON DELETE RESTRICT,
  subscription_id     UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  provider_session_id TEXT UNIQUE,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                        'pending', 'completed', 'expired', 'failed'
                      )),
  checkout_url        TEXT,
  success_url         TEXT,
  cancel_url          TEXT,
  expires_at          TIMESTAMPTZ,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX idx_checkout_sessions_price_id ON checkout_sessions(price_id);
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(status);
CREATE INDEX idx_checkout_sessions_provider_session_id ON checkout_sessions(provider_session_id);
