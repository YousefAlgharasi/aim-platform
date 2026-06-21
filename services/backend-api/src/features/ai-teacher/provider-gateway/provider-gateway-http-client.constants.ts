/**
 * P8-065: Build AI Response Generation Flow (Group G — AI Teacher Backend
 * Pipeline). Fixed, public endpoint/provider-name constants for the
 * concrete AI provider HTTP client. These are not secrets — the endpoint
 * URL is the provider's publicly documented API base, never a
 * per-deployment value — so they are kept as fixed constants rather than
 * environment config, consistent with provider-gateway-timeout.constants.ts.
 */
export const AI_PROVIDER_NAME = 'openai-compatible';
export const AI_PROVIDER_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
