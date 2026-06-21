-- P14-009: Create billing products table
-- Stores billable products/features offered by AIM.

CREATE TABLE IF NOT EXISTS billing_products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL CHECK (trim(name) <> ''),
  description         TEXT,
  product_type        TEXT NOT NULL CHECK (product_type IN (
                        'course', 'subscription', 'feature', 'addon'
                      )),
  provider_product_id TEXT UNIQUE,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
                        'active', 'inactive', 'archived'
                      )),
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_products_status ON billing_products(status);
CREATE INDEX idx_billing_products_product_type ON billing_products(product_type);
CREATE INDEX idx_billing_products_provider_product_id ON billing_products(provider_product_id);
