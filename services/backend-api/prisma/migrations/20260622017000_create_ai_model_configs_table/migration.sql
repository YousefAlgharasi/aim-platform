-- P18-015: Create AI model configs table
-- Backend-controlled model configuration. provider_key_ref is a reference
-- name resolved server-side to a secret in the secret manager/environment
-- config; no provider API key, token, or credential is ever stored here.

CREATE TABLE IF NOT EXISTS ai_model_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(150) NOT NULL UNIQUE,
  provider_key_ref VARCHAR(100) NOT NULL,
  model_id VARCHAR(150) NOT NULL,
  tier VARCHAR(20) NOT NULL DEFAULT 'standard',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',

  limits JSONB NOT NULL DEFAULT '{}',
  parameters JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ai_model_configs_tier_check
    CHECK (tier IN ('economy', 'standard', 'premium')),

  CONSTRAINT ai_model_configs_status_check
    CHECK (status IN ('draft', 'active', 'retired'))
);

CREATE OR REPLACE FUNCTION set_ai_model_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_model_configs_set_updated_at ON ai_model_configs;

CREATE TRIGGER ai_model_configs_set_updated_at
BEFORE UPDATE ON ai_model_configs
FOR EACH ROW
EXECUTE FUNCTION set_ai_model_configs_updated_at();
