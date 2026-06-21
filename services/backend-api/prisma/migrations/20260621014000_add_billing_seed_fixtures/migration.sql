-- P14-022: Add billing seed fixtures
-- Safe development fixtures for products, prices, and plans.
-- These use placeholder provider IDs for local development only.
-- No real provider secrets or production data.

INSERT INTO billing_products (id, name, description, product_type, provider_product_id, status)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'AIM Basic Access', 'Basic access to AIM learning platform', 'subscription', 'prod_dev_basic', 'active'),
  ('a0000000-0000-0000-0000-000000000002', 'AIM Premium Access', 'Premium access with advanced features', 'subscription', 'prod_dev_premium', 'active'),
  ('a0000000-0000-0000-0000-000000000003', 'AIM Enterprise Access', 'Enterprise access with all features', 'subscription', 'prod_dev_enterprise', 'active'),
  ('a0000000-0000-0000-0000-000000000004', 'Extra Practice Pack', 'Additional practice sessions addon', 'addon', 'prod_dev_practice', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO billing_prices (id, product_id, amount, currency, billing_interval, provider_price_id, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 0, 'USD', 'month', 'price_dev_basic_free', 'active'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 1999, 'USD', 'month', 'price_dev_premium_monthly', 'active'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 19990, 'USD', 'year', 'price_dev_premium_yearly', 'active'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 4999, 'USD', 'month', 'price_dev_enterprise_monthly', 'active'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 999, 'USD', 'one_time', 'price_dev_practice_pack', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO billing_plans (id, name, description, price_id, features, plan_type, status)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Free Plan', 'Basic access with limited features', 'b0000000-0000-0000-0000-000000000001',
   '{"max_lessons_per_day": 3, "max_practice_sessions": 5, "ai_teacher_access": false, "voice_teacher_access": false, "reports_access": "basic"}'::jsonb,
   'free', 'active'),
  ('c0000000-0000-0000-0000-000000000002', 'Premium Plan', 'Full access to all standard features', 'b0000000-0000-0000-0000-000000000002',
   '{"max_lessons_per_day": -1, "max_practice_sessions": -1, "ai_teacher_access": true, "voice_teacher_access": false, "reports_access": "full"}'::jsonb,
   'premium', 'active'),
  ('c0000000-0000-0000-0000-000000000003', 'Enterprise Plan', 'Full access with voice teacher and priority support', 'b0000000-0000-0000-0000-000000000004',
   '{"max_lessons_per_day": -1, "max_practice_sessions": -1, "ai_teacher_access": true, "voice_teacher_access": true, "reports_access": "full", "priority_support": true}'::jsonb,
   'enterprise', 'active')
ON CONFLICT (id) DO NOTHING;

-- Development coupon
INSERT INTO coupons (id, name, discount_type, discount_value, currency, max_redemptions, status)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Welcome Discount', 'percentage', 20, NULL, 100, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO promotion_codes (id, coupon_id, code, max_redemptions, status)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'WELCOME20', 50, 'active')
ON CONFLICT (id) DO NOTHING;
