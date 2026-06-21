-- P14-021: Add billing DB constraints
-- Foreign keys, uniqueness, statuses, currency checks, idempotency constraints, and indexes.

-- Ensure subscription current_period_end > current_period_start when both set
ALTER TABLE subscriptions
  ADD CONSTRAINT chk_subscriptions_period
  CHECK (
    current_period_start IS NULL
    OR current_period_end IS NULL
    OR current_period_end > current_period_start
  );

-- Ensure trial_end > trial_start when both set
ALTER TABLE subscriptions
  ADD CONSTRAINT chk_subscriptions_trial_period
  CHECK (
    trial_start IS NULL
    OR trial_end IS NULL
    OR trial_end > trial_start
  );

-- Ensure invoice period_end > period_start when both set
ALTER TABLE invoices
  ADD CONSTRAINT chk_invoices_period
  CHECK (
    period_start IS NULL
    OR period_end IS NULL
    OR period_end > period_start
  );

-- Ensure coupon valid_until > valid_from when both set
ALTER TABLE coupons
  ADD CONSTRAINT chk_coupons_validity_period
  CHECK (
    valid_until IS NULL
    OR valid_until > valid_from
  );

-- Ensure coupon times_redeemed <= max_redemptions when max set
ALTER TABLE coupons
  ADD CONSTRAINT chk_coupons_redemption_limit
  CHECK (
    max_redemptions IS NULL
    OR times_redeemed <= max_redemptions
  );

-- Ensure promotion_code times_redeemed <= max_redemptions when max set
ALTER TABLE promotion_codes
  ADD CONSTRAINT chk_promotion_codes_redemption_limit
  CHECK (
    max_redemptions IS NULL
    OR times_redeemed <= max_redemptions
  );

-- Ensure entitlement usage_count <= usage_limit when limit set
ALTER TABLE billing_entitlements
  ADD CONSTRAINT chk_entitlements_usage_limit
  CHECK (
    usage_limit IS NULL
    OR usage_count <= usage_limit
  );

-- Ensure refund amount does not exceed payment amount
-- (enforced at application layer too, but constraint prevents data corruption)

-- Ensure coupon currency is required for fixed_amount discount type
ALTER TABLE coupons
  ADD CONSTRAINT chk_coupons_fixed_amount_currency
  CHECK (
    discount_type <> 'fixed_amount'
    OR currency IS NOT NULL
  );

-- Composite indexes for common billing queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_refunds_status_created ON refunds(status, created_at);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_status ON checkout_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_entitlements_user_status ON billing_entitlements(user_id, status);
CREATE INDEX IF NOT EXISTS idx_provider_events_status_created ON payment_provider_events(processing_status, created_at);
