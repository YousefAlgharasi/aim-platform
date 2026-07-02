/**
 * P8-065: Build AI Response Generation Flow (Group G — AI Teacher Backend
 * Pipeline). Fixed provider-name constant for the concrete AI provider
 * HTTP client. The endpoint URL itself is per-deployment config — see
 * AI_PROVIDER_BASE_URL in backend-config.validation.ts — so any
 * OpenAI-compatible provider (OpenAI, Groq, etc.) can be used without a
 * code change.
 */
export const AI_PROVIDER_NAME = 'openai-compatible';
