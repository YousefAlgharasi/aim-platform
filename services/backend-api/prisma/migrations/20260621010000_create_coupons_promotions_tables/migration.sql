-- P14-018: Create coupons and promotion_codes tables
-- Supports controlled discounts with eligibility, status, and limits.

CREATE TABLE IF NOT EXISTS coupons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL CHECK (trim(name) <> ''),
  discount_type     TEXT NOT NULL CHECK (discount_type IN (
                      'percentage', 'fixed_amount'
                    )),
  discount_value    INTEGER NOT NULL CHECK (discount_value > 0),
  currency          TEXT CHECK (currency ~ '^[A-Z]{3}$'),
  max_redemptions   INTEGER,
  times_redeemed    INTEGER NOT NULL DEFAULT 0,
  valid_from        TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until       TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
                      'active', 'expired', 'disabled'
                    )),
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotion_codes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id         UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  code              TEXT NOT NULL UNIQUE CHECK (trim(code) <> ''),
  max_redemptions   INTEGER,
  times_redeemed    INTEGER NOT NULL DEFAULT 0,
  eligible_user_ids UUID[],
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
                      'active', 'expired', 'disabled'
                    )),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_promotion_codes_coupon_id ON promotion_codes(coupon_id);
CREATE INDEX idx_promotion_codes_code ON promotion_codes(code);
CREATE INDEX idx_promotion_codes_status ON promotion_codes(status);
