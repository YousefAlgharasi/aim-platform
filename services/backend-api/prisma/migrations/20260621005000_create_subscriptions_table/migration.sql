-- P14-013: Create subscriptions table
-- Tracks subscription lifecycle and provider subscription metadata.

CREATE TABLE IF NOT EXISTS subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id                   UUID NOT NULL REFERENCES billing_plans(id) ON DELETE RESTRICT,
  provider_subscription_id  TEXT UNIQUE,
  status                    TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
                              'active', 'past_due', 'canceled', 'expired',
                              'trialing', 'paused', 'incomplete'
                            )),
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  cancel_at_period_end      BOOLEAN NOT NULL DEFAULT false,
  canceled_at               TIMESTAMPTZ,
  trial_start               TIMESTAMPTZ,
  trial_end                 TIMESTAMPTZ,
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_provider_subscription_id ON subscriptions(provider_subscription_id);

-- Add FK from billing_entitlements to subscriptions now that subscriptions table exists
ALTER TABLE billing_entitlements
  ADD CONSTRAINT fk_billing_entitlements_subscription
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL;
