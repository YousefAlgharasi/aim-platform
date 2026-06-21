-- P14-010: Create billing prices table
-- Stores price records with currency, billing interval, and provider price ID.

CREATE TABLE IF NOT EXISTS billing_prices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID NOT NULL REFERENCES billing_products(id) ON DELETE CASCADE,
  amount            INTEGER NOT NULL CHECK (amount >= 0),
  currency          TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  billing_interval  TEXT NOT NULL CHECK (billing_interval IN (
                      'month', 'year', 'one_time'
                    )),
  provider_price_id TEXT UNIQUE,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
                      'active', 'inactive', 'archived'
                    )),
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_prices_product_id ON billing_prices(product_id);
CREATE INDEX idx_billing_prices_status ON billing_prices(status);
CREATE INDEX idx_billing_prices_provider_price_id ON billing_prices(provider_price_id);
