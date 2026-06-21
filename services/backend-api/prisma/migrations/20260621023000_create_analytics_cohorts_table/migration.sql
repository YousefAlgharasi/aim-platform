-- P15-019: Create analytics_cohorts table
-- Backend-defined segment of users/students for reporting/filtering.

CREATE TABLE IF NOT EXISTS analytics_cohorts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT,
  cohort_type  TEXT NOT NULL CHECK (cohort_type IN ('static', 'dynamic')),
  definition   JSONB NOT NULL DEFAULT '{}',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_cohorts_cohort_type ON analytics_cohorts(cohort_type);
CREATE INDEX idx_analytics_cohorts_is_active ON analytics_cohorts(is_active);

CREATE TABLE IF NOT EXISTS analytics_cohort_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id   UUID NOT NULL REFERENCES analytics_cohorts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cohort_id, user_id)
);

CREATE INDEX idx_analytics_cohort_members_cohort_id ON analytics_cohort_members(cohort_id);
CREATE INDEX idx_analytics_cohort_members_user_id ON analytics_cohort_members(user_id);
