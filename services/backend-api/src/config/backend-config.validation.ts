import { BackendConfig, BackendNodeEnv } from './backend-config.types';

const allowedNodeEnvs = ['development', 'test', 'staging', 'production'] as const;

type RawEnv = NodeJS.ProcessEnv;

export class BackendConfigValidationError extends Error {
  constructor(readonly issues: readonly string[]) {
    super(`Backend configuration validation failed: ${issues.join('; ')}`);
    this.name = 'BackendConfigValidationError';
  }
}

export function validateBackendConfig(env: RawEnv = process.env): BackendConfig {
  const issues: string[] = [];

  const nodeEnv = readRequiredString(env, 'NODE_ENV', issues);
  const portValue = readRequiredString(env, 'PORT', issues);

  const supabaseUrl = readRequiredUrl(env, 'SUPABASE_URL', issues);
  const supabaseAnonKey = readRequiredString(env, 'SUPABASE_ANON_KEY', issues);
  const supabaseServiceRoleKey = readRequiredString(env, 'SUPABASE_SERVICE_ROLE_KEY', issues);
  const supabaseJwtSecret = readRequiredString(env, 'SUPABASE_JWT_SECRET', issues);
  const supabaseJwtIssuer = readOptionalUrl(
    env,
    'SUPABASE_JWT_ISSUER',
    supabaseUrl === '' ? supabaseUrl : `${supabaseUrl.replace(/\/+$/, '')}/auth/v1`,
    issues,
  );
  const supabaseJwtAudience = readRequiredString(env, 'SUPABASE_JWT_AUDIENCE', issues);
  const databaseUrl = readRequiredUrl(env, 'DATABASE_URL', issues);
  const aimEngineUrl = readRequiredUrl(env, 'AIM_ENGINE_URL', issues);
  // P5-044 — Phase 5 AIM adapter settings (values from P5-008 timeout/retry policy).
  // AIM_ENGINE_SERVICE_TOKEN is a secret: never logged, never returned to clients.
  const aimEngineServiceToken = readRequiredString(env, 'AIM_ENGINE_SERVICE_TOKEN', issues);
  const aimEngineAnalysisTimeoutMs = readOptionalPositiveInt(
    env,
    'AIM_ENGINE_ANALYSIS_TIMEOUT_MS',
    5000,
    issues,
  );
  const aimEngineHealthTimeoutMs = readOptionalPositiveInt(
    env,
    'AIM_ENGINE_HEALTH_TIMEOUT_MS',
    3000,
    issues,
  );
  const aimEngineTotalBudgetMs = readOptionalPositiveInt(
    env,
    'AIM_ENGINE_TOTAL_BUDGET_MS',
    12000,
    issues,
  );
  const aimEngineMaxRetryAttempts = readOptionalPositiveInt(
    env,
    'AIM_ENGINE_MAX_RETRY_ATTEMPTS',
    3,
    issues,
  );
  const aiProviderApiKey = readRequiredString(env, 'AI_PROVIDER_API_KEY', issues);
  const aiProviderModel = readRequiredString(env, 'AI_PROVIDER_MODEL', issues);
  // Optional — lets any OpenAI-compatible provider (e.g. Groq) be used by
  // setting AI_PROVIDER_BASE_URL instead of hard-coding OpenAI's endpoint.
  const aiProviderBaseUrl = readOptionalUrl(
    env,
    'AI_PROVIDER_BASE_URL',
    'https://api.openai.com/v1/chat/completions',
    issues,
  );
  // P9-039 — STT provider settings for Group E's STT Gateway.
  // STT_PROVIDER_API_KEY is a secret: never logged, never returned to clients.
  const sttProviderApiKey = readRequiredString(env, 'STT_PROVIDER_API_KEY', issues);
  const sttProviderModel = readRequiredString(env, 'STT_PROVIDER_MODEL', issues);
  // P9-059 — TTS provider settings for Group G's TTS Gateway.
  // TTS_PROVIDER_API_KEY is a secret: never logged, never returned to clients.
  const ttsProviderApiKey = readRequiredString(env, 'TTS_PROVIDER_API_KEY', issues);
  const ttsProviderModel = readRequiredString(env, 'TTS_PROVIDER_MODEL', issues);
  const corsOriginsValue = readRequiredString(env, 'CORS_ORIGINS', issues);
  // P19-006 — Placement retake cooldown, configurable per environment.
  const placementRetakeCooldownHours = readOptionalPositiveInt(
    env,
    'PLACEMENT_RETAKE_COOLDOWN_HOURS',
    24,
    issues,
  );

  const parsedNodeEnv = parseNodeEnv(nodeEnv, issues);
  const port = parsePort(portValue, issues);
  const corsOrigins = parseCorsOrigins(corsOriginsValue, issues);

  if (issues.length > 0) {
    throw new BackendConfigValidationError(issues);
  }

  return {
    nodeEnv: parsedNodeEnv,
    port,
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      serviceRoleKey: supabaseServiceRoleKey,
      jwtSecret: supabaseJwtSecret,
      jwtIssuer: supabaseJwtIssuer,
      jwtAudience: supabaseJwtAudience,
    },
    database: {
      url: databaseUrl,
    },
    aimEngine: {
      url: aimEngineUrl,
      serviceToken: aimEngineServiceToken,
      analysisTimeoutMs: aimEngineAnalysisTimeoutMs,
      healthTimeoutMs: aimEngineHealthTimeoutMs,
      totalBudgetMs: aimEngineTotalBudgetMs,
      maxRetryAttempts: aimEngineMaxRetryAttempts,
    },
    aiProvider: {
      apiKey: aiProviderApiKey,
      model: aiProviderModel,
      baseUrl: aiProviderBaseUrl,
    },
    sttProvider: {
      apiKey: sttProviderApiKey,
      model: sttProviderModel,
    },
    ttsProvider: {
      apiKey: ttsProviderApiKey,
      model: ttsProviderModel,
    },
    cors: {
      origins: corsOrigins,
    },
    placement: {
      retakeCooldownHours: placementRetakeCooldownHours,
    },
  };
}

function readRequiredString(env: RawEnv, key: string, issues: string[]): string {
  const value = env[key];

  if (value === undefined || value.trim() === '') {
    issues.push(`${key} is required`);
    return '';
  }

  return value.trim();
}

function readRequiredUrl(env: RawEnv, key: string, issues: string[]): string {
  const value = readRequiredString(env, key, issues);

  if (value !== '' && !isValidUrl(value)) {
    issues.push(`${key} must be a valid URL`);
  }

  return value;
}

function readOptionalUrl(
  env: RawEnv,
  key: string,
  fallback: string,
  issues: string[],
): string {
  const value = env[key]?.trim() ?? fallback;

  if (value !== '' && !isValidUrl(value)) {
    issues.push(`${key} must be a valid URL`);
  }

  return value;
}

function parseNodeEnv(value: string, issues: string[]): BackendNodeEnv {
  if ((allowedNodeEnvs as readonly string[]).includes(value)) {
    return value as BackendNodeEnv;
  }

  issues.push(`NODE_ENV must be one of: ${allowedNodeEnvs.join(', ')}`);
  return 'development';
}

function parsePort(value: string, issues: string[]): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    issues.push('PORT must be an integer between 1 and 65535');
    return 3000;
  }

  return port;
}

function parseCorsOrigins(value: string, issues: string[]): string[] {
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    issues.push('CORS_ORIGINS must include at least one origin');
    return [];
  }

  for (const origin of origins) {
    if (!isValidUrl(origin)) {
      issues.push(`CORS_ORIGINS contains an invalid origin: ${origin}`);
    }
  }

  return origins;
}

function readOptionalPositiveInt(
  env: RawEnv,
  key: string,
  defaultValue: number,
  issues: string[],
): number {
  const raw = env[key]?.trim();
  if (raw === undefined || raw === '') {
    return defaultValue;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    issues.push(`${key} must be a positive integer`);
    return defaultValue;
  }
  return parsed;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
