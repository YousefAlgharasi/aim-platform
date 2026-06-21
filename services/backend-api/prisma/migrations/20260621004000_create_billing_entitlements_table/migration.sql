-- P14-012: Create billing entitlements table
-- Stores user/student/parent feature access entitlements.

CREATE TABLE IF NOT EXISTS billing_entitlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id         UUID REFERENCES billing_plans(id) ON DELETE SET NULL,
  subscription_id UUID,
  feature_key     TEXT NOT NULL CHECK (trim(feature_key) <> ''),
  granted         BOOLEAN NOT NULL DEFAULT true,
  usage_limit     INTEGER,
  usage_count     INTEGER NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  source          TEXT NOT NULL CHECK (source IN (
                    'subscription', 'payment', 'admin_grant', 'promotion'
                  )),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
                    'active', 'expired', 'revoked'
                  )),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_entitlements_user_id ON billing_entitlements(user_id);
CREATE INDEX idx_billing_entitlements_plan_id ON billing_entitlements(plan_id);
CREATE INDEX idx_billing_entitlements_subscription_id ON billing_entitlements(subscription_id);
CREATE INDEX idx_billing_entitlements_feature_key ON billing_entitlements(feature_key);
CREATE INDEX idx_billing_entitlements_status ON billing_entitlements(status);
CREATE INDEX idx_billing_entitlements_user_feature ON billing_entitlements(user_id, feature_key);
