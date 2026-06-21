-- P17-019: Create feature flags table
-- Feature flags with rollout percentage and audience targeting.

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  flag_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,

  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INT NOT NULL DEFAULT 0,

  audience JSONB NOT NULL DEFAULT '{}',

  owner_id UUID
    REFERENCES users (id),

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT feature_flags_rollout_percentage_check
    CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)
);

CREATE OR REPLACE FUNCTION set_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS feature_flags_set_updated_at ON feature_flags;

CREATE TRIGGER feature_flags_set_updated_at
BEFORE UPDATE ON feature_flags
FOR EACH ROW
EXECUTE FUNCTION set_feature_flags_updated_at();
