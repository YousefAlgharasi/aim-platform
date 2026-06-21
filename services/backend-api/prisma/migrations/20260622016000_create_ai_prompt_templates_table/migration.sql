-- P18-014: Create AI prompt templates table
-- Backend-controlled prompt templates. Body must never contain provider
-- secrets, API keys, or other credentials. Clients never select or submit
-- a prompt_template_id; the backend resolves the active template server-side.

CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(150) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  locale VARCHAR(10) NOT NULL DEFAULT 'en',
  audience VARCHAR(50) NOT NULL DEFAULT 'student',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',

  body TEXT NOT NULL,
  safety_tags JSONB NOT NULL DEFAULT '[]',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ai_prompt_templates_status_check
    CHECK (status IN ('draft', 'active', 'retired')),

  CONSTRAINT ai_prompt_templates_name_version_unique
    UNIQUE (name, version)
);

CREATE OR REPLACE FUNCTION set_ai_prompt_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_prompt_templates_set_updated_at ON ai_prompt_templates;

CREATE TRIGGER ai_prompt_templates_set_updated_at
BEFORE UPDATE ON ai_prompt_templates
FOR EACH ROW
EXECUTE FUNCTION set_ai_prompt_templates_updated_at();
