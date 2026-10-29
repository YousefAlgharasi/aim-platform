-- Course billing: per-course prices with discounts, manual wallet payments
-- reviewed by admins, and time-limited course access.
--
-- Flow:
--   1. Admin sets a price (and optional discount) per course in
--      course_prices. A course with no row, or an effective price of 0, is
--      free.
--   2. Admin adds the wallets students can pay with (payment_wallets), each
--      with an optional logo and an optional image showing the account
--      number or a QR code.
--   3. Student transfers the money, then submits a course_payment_requests
--      row: wallet, transaction number and a receipt screenshot.
--   4. Admin approves or rejects the request. Approval creates a
--      course_access row that unlocks the course for access_days (30 by
--      default) from the approval time.
--   5. If the course isn't finished before expires_at the access becomes
--      'failed', the student's progress in that course is reset, and they
--      must pay again to retake it.
--
-- Images (wallet logos, wallet QR/number images, receipts) are stored in
-- payment_images so they survive redeploys of the API container.

CREATE TABLE IF NOT EXISTS payment_images (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose        TEXT         NOT NULL,
  content_type   TEXT         NOT NULL,
  byte_size      INTEGER      NOT NULL,
  data           BYTEA        NOT NULL,
  uploaded_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT payment_images_purpose_check
    CHECK (purpose IN ('wallet_logo', 'wallet_qr', 'receipt')),
  CONSTRAINT payment_images_content_type_check
    CHECK (content_type IN ('image/png', 'image/jpeg', 'image/webp')),
  CONSTRAINT payment_images_size_check
    CHECK (byte_size > 0 AND byte_size <= 5242880)
);

CREATE TABLE IF NOT EXISTS course_prices (
  course_id           UUID           PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  amount              NUMERIC(12,2)  NOT NULL DEFAULT 0,
  currency            TEXT           NOT NULL DEFAULT 'YER',
  discount_type       TEXT           NOT NULL DEFAULT 'none',
  discount_value      NUMERIC(12,2)  NOT NULL DEFAULT 0,
  discount_starts_at  TIMESTAMPTZ,
  discount_ends_at    TIMESTAMPTZ,
  access_days         INTEGER        NOT NULL DEFAULT 30,
  updated_by          UUID           REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),

  CONSTRAINT course_prices_amount_check CHECK (amount >= 0),
  CONSTRAINT course_prices_currency_check CHECK (currency IN ('YER', 'SAR', 'USD')),
  CONSTRAINT course_prices_discount_type_check
    CHECK (discount_type IN ('none', 'percent', 'fixed')),
  CONSTRAINT course_prices_discount_value_check CHECK (
    discount_value >= 0
    AND (discount_type <> 'percent' OR discount_value <= 100)
    AND (discount_type <> 'fixed' OR discount_value <= amount)
  ),
  CONSTRAINT course_prices_discount_window_check CHECK (
    discount_starts_at IS NULL OR discount_ends_at IS NULL
    OR discount_ends_at > discount_starts_at
  ),
  CONSTRAINT course_prices_access_days_check CHECK (access_days BETWEEN 1 AND 365)
);

CREATE TABLE IF NOT EXISTS payment_wallets (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT         NOT NULL,
  account_name    TEXT,
  account_number  TEXT,
  instructions    TEXT,
  logo_image_id   UUID         REFERENCES payment_images(id) ON DELETE SET NULL,
  qr_image_id     UUID         REFERENCES payment_images(id) ON DELETE SET NULL,
  is_active       BOOLEAN      NOT NULL DEFAULT true,
  sort_order      INTEGER      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT payment_wallets_name_check CHECK (length(trim(name)) > 0)
);

CREATE TABLE IF NOT EXISTS course_payment_requests (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id           UUID           NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  wallet_id           UUID           NOT NULL REFERENCES payment_wallets(id) ON DELETE RESTRICT,
  transaction_number  TEXT           NOT NULL,
  receipt_image_id    UUID           NOT NULL REFERENCES payment_images(id) ON DELETE RESTRICT,
  original_amount     NUMERIC(12,2)  NOT NULL,
  discount_amount     NUMERIC(12,2)  NOT NULL DEFAULT 0,
  amount              NUMERIC(12,2)  NOT NULL,
  currency            TEXT           NOT NULL,
  status              TEXT           NOT NULL DEFAULT 'pending',
  admin_note          TEXT,
  reviewed_by         UUID           REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),

  CONSTRAINT course_payment_requests_status_check
    CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT course_payment_requests_transaction_check
    CHECK (length(trim(transaction_number)) > 0),
  CONSTRAINT course_payment_requests_amount_check
    CHECK (amount >= 0 AND original_amount >= 0 AND discount_amount >= 0)
);

-- One open request per student and course.
CREATE UNIQUE INDEX IF NOT EXISTS course_payment_requests_one_pending_idx
  ON course_payment_requests (student_id, course_id) WHERE status = 'pending';

-- The same transaction can't be used twice on a wallet (unless rejected).
CREATE UNIQUE INDEX IF NOT EXISTS course_payment_requests_transaction_idx
  ON course_payment_requests (wallet_id, lower(trim(transaction_number)))
  WHERE status IN ('pending', 'approved');

CREATE INDEX IF NOT EXISTS course_payment_requests_status_idx
  ON course_payment_requests (status, created_at DESC);

CREATE TABLE IF NOT EXISTS course_access (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id           UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  payment_request_id  UUID         REFERENCES course_payment_requests(id) ON DELETE SET NULL,
  status              TEXT         NOT NULL DEFAULT 'active',
  starts_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  expires_at          TIMESTAMPTZ  NOT NULL,
  completed_at        TIMESTAMPTZ,
  failed_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT course_access_status_check
    CHECK (status IN ('active', 'completed', 'failed', 'revoked')),
  CONSTRAINT course_access_window_check CHECK (expires_at > starts_at)
);

-- At most one live (active) access window per student and course.
CREATE UNIQUE INDEX IF NOT EXISTS course_access_one_active_idx
  ON course_access (student_id, course_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS course_access_student_idx
  ON course_access (student_id, course_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_course_billing_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS course_prices_set_updated_at ON course_prices;
CREATE TRIGGER course_prices_set_updated_at
BEFORE UPDATE ON course_prices FOR EACH ROW EXECUTE FUNCTION set_course_billing_updated_at();

DROP TRIGGER IF EXISTS payment_wallets_set_updated_at ON payment_wallets;
CREATE TRIGGER payment_wallets_set_updated_at
BEFORE UPDATE ON payment_wallets FOR EACH ROW EXECUTE FUNCTION set_course_billing_updated_at();

DROP TRIGGER IF EXISTS course_payment_requests_set_updated_at ON course_payment_requests;
CREATE TRIGGER course_payment_requests_set_updated_at
BEFORE UPDATE ON course_payment_requests FOR EACH ROW EXECUTE FUNCTION set_course_billing_updated_at();

DROP TRIGGER IF EXISTS course_access_set_updated_at ON course_access;
CREATE TRIGGER course_access_set_updated_at
BEFORE UPDATE ON course_access FOR EACH ROW EXECUTE FUNCTION set_course_billing_updated_at();

-- Backend-owned tables: no PostgREST access (deny-by-default RLS).
ALTER TABLE payment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;
