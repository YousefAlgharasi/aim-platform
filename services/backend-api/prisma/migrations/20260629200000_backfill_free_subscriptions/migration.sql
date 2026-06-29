-- Every student should be on the free plan by default until they upgrade,
-- but no subscription was ever created for students who signed up before
-- AuthProfileBootstrapService.ensureFreeSubscription started provisioning
-- one automatically. Backfill a free-plan subscription (and the matching
-- entitlements) for any existing student user with no subscription at all.

WITH free_plan AS (
  SELECT id, features FROM billing_plans WHERE plan_type = 'free' AND status = 'active' LIMIT 1
),
missing_students AS (
  SELECT u.id AS user_id
  FROM users u
  WHERE u.user_type = 'student'
    AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id)
),
new_subscriptions AS (
  INSERT INTO subscriptions (user_id, plan_id, status)
  SELECT ms.user_id, fp.id, 'active'
  FROM missing_students ms, free_plan fp
  RETURNING id, user_id, plan_id
)
INSERT INTO billing_entitlements (
  user_id, plan_id, subscription_id, feature_key, granted, usage_limit, usage_count, source, status
)
SELECT
  ns.user_id,
  ns.plan_id,
  ns.id,
  feature.key,
  feature.value NOT IN ('false', '0'),
  CASE
    WHEN feature.value::text ~ '^[0-9]+$' AND feature.value::int > 0 THEN feature.value::int
    ELSE NULL
  END,
  0,
  'subscription',
  'active'
FROM new_subscriptions ns
JOIN free_plan fp ON fp.id = ns.plan_id
CROSS JOIN LATERAL jsonb_each_text(fp.features) AS feature(key, value);
