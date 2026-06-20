-- P14-016: Create invoices and invoice_items tables
-- Tracks invoices, line items, totals, status, and provider invoice IDs.

CREATE TABLE IF NOT EXISTS invoices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id     UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  provider_invoice_id TEXT UNIQUE,
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                        'draft', 'open', 'paid', 'void', 'uncollectible'
                      )),
  subtotal            INTEGER NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax                 INTEGER NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total               INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
  currency            TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  invoice_url         TEXT,
  period_start        TIMESTAMPTZ,
  period_end          TIMESTAMPTZ,
  due_date            TIMESTAMPTZ,
  paid_at             TIMESTAMPTZ,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  price_id      UUID REFERENCES billing_prices(id) ON DELETE SET NULL,
  description   TEXT NOT NULL CHECK (trim(description) <> ''),
  quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_amount   INTEGER NOT NULL CHECK (unit_amount >= 0),
  amount        INTEGER NOT NULL CHECK (amount >= 0),
  currency      TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_provider_invoice_id ON invoices(provider_invoice_id);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
