-- P14-011: Create billing plans table
-- Stores subscription plans with included features, limits, and status.

CREATE TABLE IF NOT EXISTS billing_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL CHECK (trim(name) <> ''),
  description   TEXT,
  price_id      UUID NOT NULL REFERENCES billing_prices(id) ON DELETE RESTRICT,
  features      JSONB NOT NULL DEFAULT '{}',
  plan_type     TEXT NOT NULL CHECK (plan_type IN (
                  'free', 'basic', 'premium', 'enterprise'
                )),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
                  'active', 'inactive', 'archived'
                )),
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_plans_price_id ON billing_plans(price_id);
CREATE INDEX idx_billing_plans_status ON billing_plans(status);
CREATE INDEX idx_billing_plans_plan_type ON billing_plans(plan_type);
