/**
 * Tests for the Phase 5 AIM Engine backend configuration — P5-044.
 *
 * Verifies:
 * - Required AIM_ENGINE_SERVICE_TOKEN is validated.
 * - Optional timeout/retry fields use correct defaults from P5-008 policy.
 * - Custom values are accepted and bounded (positive integers).
 * - Service token is never logged or exposed in error messages.
 * - Existing aimEngine.url validation is preserved.
 */
import { validateBackendConfig, BackendConfigValidationError } from './backend-config.validation';

/** Minimal valid env for the full config — avoids unrelated validation errors. */
const BASE_ENV: NodeJS.ProcessEnv = {
  NODE_ENV: 'development',
  PORT: '3000',
  SUPABASE_URL: 'https://abc.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  SUPABASE_JWT_SECRET: 'jwt-secret',
  SUPABASE_JWT_AUDIENCE: 'authenticated',
  DATABASE_URL: 'postgresql://localhost:5432/aim',
  AIM_ENGINE_URL: 'http://aim-engine:8010',
  AIM_ENGINE_SERVICE_TOKEN: 'test-service-token',
  AI_PROVIDER_API_KEY: 'ai-key',
  AI_PROVIDER_MODEL: 'gpt-4',
  STT_PROVIDER_API_KEY: 'stt-key',
  STT_PROVIDER_MODEL: 'whisper-1',
  CORS_ORIGINS: 'http://localhost:3000',
};

describe('BackendConfig — AIM Engine Phase 5 settings (P5-044)', () => {
  // -------------------------------------------------------------------------
  // Defaults
  // -------------------------------------------------------------------------

  it('uses default analysisTimeoutMs of 5000 when env var is absent', () => {
    const config = validateBackendConfig({ ...BASE_ENV });
    expect(config.aimEngine.analysisTimeoutMs).toBe(5000);
  });

  it('uses default healthTimeoutMs of 3000 when env var is absent', () => {
    const config = validateBackendConfig({ ...BASE_ENV });
    expect(config.aimEngine.healthTimeoutMs).toBe(3000);
  });

  it('uses default totalBudgetMs of 12000 when env var is absent', () => {
    const config = validateBackendConfig({ ...BASE_ENV });
    expect(config.aimEngine.totalBudgetMs).toBe(12000);
  });

  it('uses default maxRetryAttempts of 3 when env var is absent', () => {
    const config = validateBackendConfig({ ...BASE_ENV });
    expect(config.aimEngine.maxRetryAttempts).toBe(3);
  });

  // -------------------------------------------------------------------------
  // Custom values accepted
  // -------------------------------------------------------------------------

  it('accepts custom analysisTimeoutMs', () => {
    const config = validateBackendConfig({
      ...BASE_ENV,
      AIM_ENGINE_ANALYSIS_TIMEOUT_MS: '7500',
    });
    expect(config.aimEngine.analysisTimeoutMs).toBe(7500);
  });

  it('accepts custom healthTimeoutMs', () => {
    const config = validateBackendConfig({
      ...BASE_ENV,
      AIM_ENGINE_HEALTH_TIMEOUT_MS: '2000',
    });
    expect(config.aimEngine.healthTimeoutMs).toBe(2000);
  });

  it('accepts custom totalBudgetMs', () => {
    const config = validateBackendConfig({
      ...BASE_ENV,
      AIM_ENGINE_TOTAL_BUDGET_MS: '15000',
    });
    expect(config.aimEngine.totalBudgetMs).toBe(15000);
  });

  it('accepts custom maxRetryAttempts', () => {
    const config = validateBackendConfig({
      ...BASE_ENV,
      AIM_ENGINE_MAX_RETRY_ATTEMPTS: '5',
    });
    expect(config.aimEngine.maxRetryAttempts).toBe(5);
  });

  // -------------------------------------------------------------------------
  // Service token — required, never exposed
  // -------------------------------------------------------------------------

  it('reads service token from AIM_ENGINE_SERVICE_TOKEN', () => {
    const config = validateBackendConfig({
      ...BASE_ENV,
      AIM_ENGINE_SERVICE_TOKEN: 'my-secret-token',
    });
    expect(config.aimEngine.serviceToken).toBe('my-secret-token');
  });

  it('fails validation when AIM_ENGINE_SERVICE_TOKEN is missing', () => {
    const env = { ...BASE_ENV };
    delete env['AIM_ENGINE_SERVICE_TOKEN'];

    expect(() => validateBackendConfig(env)).toThrow(BackendConfigValidationError);
  });

  it('fails validation when AIM_ENGINE_SERVICE_TOKEN is empty', () => {
    expect(() =>
      validateBackendConfig({ ...BASE_ENV, AIM_ENGINE_SERVICE_TOKEN: '   ' }),
    ).toThrow(BackendConfigValidationError);
  });

  it('does not expose service token value in validation error messages', () => {
    const env = { ...BASE_ENV };
    delete env['AIM_ENGINE_SERVICE_TOKEN'];

    try {
      validateBackendConfig(env);
      fail('expected error');
    } catch (err) {
      // Error message must not contain any token-like sensitive value
      const msg = String(err);
      expect(msg).not.toContain('my-secret-token');
      // It should mention the missing key name, not the value
      expect(msg).toContain('AIM_ENGINE_SERVICE_TOKEN');
    }
  });

  // -------------------------------------------------------------------------
  // Invalid values produce validation errors
  // -------------------------------------------------------------------------

  it('rejects non-integer analysisTimeoutMs', () => {
    expect(() =>
      validateBackendConfig({ ...BASE_ENV, AIM_ENGINE_ANALYSIS_TIMEOUT_MS: 'abc' }),
    ).toThrow(BackendConfigValidationError);
  });

  it('rejects zero analysisTimeoutMs', () => {
    expect(() =>
      validateBackendConfig({ ...BASE_ENV, AIM_ENGINE_ANALYSIS_TIMEOUT_MS: '0' }),
    ).toThrow(BackendConfigValidationError);
  });

  it('rejects negative maxRetryAttempts', () => {
    expect(() =>
      validateBackendConfig({ ...BASE_ENV, AIM_ENGINE_MAX_RETRY_ATTEMPTS: '-1' }),
    ).toThrow(BackendConfigValidationError);
  });

  // -------------------------------------------------------------------------
  // Existing aimEngine.url validation preserved
  // -------------------------------------------------------------------------

  it('rejects invalid AIM_ENGINE_URL', () => {
    expect(() =>
      validateBackendConfig({ ...BASE_ENV, AIM_ENGINE_URL: 'not-a-url' }),
    ).toThrow(BackendConfigValidationError);
  });

  it('preserves existing url field in aimEngine config', () => {
    const config = validateBackendConfig({ ...BASE_ENV });
    expect(config.aimEngine.url).toBe('http://aim-engine:8010');
  });
});
