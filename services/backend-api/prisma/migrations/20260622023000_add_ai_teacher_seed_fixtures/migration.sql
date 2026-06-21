-- P18-021: Add AI Teacher seed fixtures
-- Safe development prompt/model/safety fixtures. No real provider
-- secrets, API keys, or production data — provider_key_ref values below
-- are non-secret placeholder reference strings only, resolved to actual
-- credentials elsewhere in a secret manager (never in this database).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM ai_prompt_templates WHERE name = 'lesson_help' AND version = 1
  ) THEN
    INSERT INTO ai_prompt_templates (id, name, version, locale, audience, status, body, safety_tags)
    VALUES (
      'd0000000-0000-0000-0000-000000000001',
      'lesson_help',
      1,
      'en',
      'student',
      'active',
      'You are an AI Teacher helping a student understand a lesson. Explain clearly and stay within the provided context. Never reveal mastery, progress, or assessment data.',
      '["no_authority_change", "no_diagnosis"]'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM ai_prompt_templates WHERE name = 'safety_instruction' AND version = 1
  ) THEN
    INSERT INTO ai_prompt_templates (id, name, version, locale, audience, status, body, safety_tags)
    VALUES (
      'd0000000-0000-0000-0000-000000000002',
      'safety_instruction',
      1,
      'en',
      'student',
      'active',
      'Do not discuss unsafe topics. Redirect off-topic or unsafe requests back to the lesson.',
      '["safety_boundary"]'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM ai_model_configs WHERE name = 'dev-economy-default') THEN
    INSERT INTO ai_model_configs (id, name, provider_key_ref, model_id, tier, status, limits, parameters)
    VALUES (
      'e0000000-0000-0000-0000-000000000001',
      'dev-economy-default',
      'dev-placeholder-economy-key-ref',
      'dev-economy-model',
      'economy',
      'active',
      '{"maxTokens": 512, "dailyBudgetUsd": 2.0}',
      '{"temperature": 0.3}'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM ai_model_configs WHERE name = 'dev-standard-default') THEN
    INSERT INTO ai_model_configs (id, name, provider_key_ref, model_id, tier, status, limits, parameters)
    VALUES (
      'e0000000-0000-0000-0000-000000000002',
      'dev-standard-default',
      'dev-placeholder-standard-key-ref',
      'dev-standard-model',
      'standard',
      'active',
      '{"maxTokens": 1024, "dailyBudgetUsd": 5.0}',
      '{"temperature": 0.5}'
    );
  END IF;
END $$;
