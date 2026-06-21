/**
 * P8-057: AI Provider Timeout Policy — constants (Group F — AI Provider
 * Gateway). Fixed timeout/retry/backoff rules for AI Teacher provider
 * calls, scoped to chat-latency expectations (text chat, not the heavier
 * AIM Engine analysis budget in backend-config.ts). Kept as fixed
 * constants rather than environment config since these are UX/latency
 * tuning values, not secrets or per-deployment endpoints.
 */
export const AI_PROVIDER_CALL_TIMEOUT_MS = 8_000;
export const AI_PROVIDER_TOTAL_BUDGET_MS = 15_000;
export const AI_PROVIDER_MAX_ATTEMPTS = 2;
export const AI_PROVIDER_BACKOFF_BASE_MS = 200;
export const AI_PROVIDER_BACKOFF_CAP_MS = 1_500;
