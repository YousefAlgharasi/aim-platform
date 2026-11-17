-- Course coupons: a visitor (with or without an account) pays into a wallet, the admin approves the payment, and a
-- single-use coupon code for ONE course is issued. Redeeming the code gives that student the course for good
-- (course_access with no deadline).

CREATE TABLE IF NOT EXISTS coupon_purchases (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token       TEXT        NOT NULL UNIQUE,
  course_id          UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  buyer_name         TEXT        NOT NULL CHECK (char_length(btrim(buyer_name)) BETWEEN 2 AND 80),
  buyer_contact      TEXT        NOT NULL CHECK (char_length(btrim(buyer_contact)) BETWEEN 5 AND 120),
  buyer_user_id      UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  wallet_id          UUID        NOT NULL REFERENCES payment_wallets(id),
  transaction_number TEXT        NOT NULL CHECK (char_length(btrim(transaction_number)) > 0),
  receipt_image_id   UUID        NOT NULL REFERENCES payment_images(id),
  original_amount    NUMERIC(12,2) NOT NULL CHECK (original_amount >= 0),
  discount_amount    NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  amount             NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency           TEXT        NOT NULL,
  status             TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note         TEXT        NULL,
  reviewed_by        UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at        TIMESTAMPTZ NULL,
  coupon_id          UUID        NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS coupon_purchases_tx_idx
  ON coupon_purchases (wallet_id, lower(btrim(transaction_number)));
CREATE UNIQUE INDEX IF NOT EXISTS coupon_purchases_one_pending_idx
  ON coupon_purchases (course_id, lower(btrim(buyer_contact))) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS coupon_purchases_status_idx ON coupon_purchases (status, created_at DESC);

CREATE TABLE IF NOT EXISTS course_coupons (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT        NOT NULL UNIQUE,
  course_id   UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'redeemed', 'void')),
  source      TEXT        NOT NULL DEFAULT 'admin' CHECK (source IN ('purchase', 'admin')),
  purchase_id UUID        NULL REFERENCES coupon_purchases(id) ON DELETE SET NULL,
  note        TEXT        NULL,
  created_by  UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  redeemed_by UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_coupons_course_idx ON course_coupons (course_id, status);

ALTER TABLE coupon_purchases ADD CONSTRAINT coupon_purchases_coupon_fk
  FOREIGN KEY (coupon_id) REFERENCES course_coupons(id) ON DELETE SET NULL;
