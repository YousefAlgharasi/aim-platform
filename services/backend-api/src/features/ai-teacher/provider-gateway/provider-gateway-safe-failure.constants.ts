/**
 * P8-058: AI Provider Safe Failure Handling — constants.
 * Fixed, student-facing fallback text used whenever the AI provider
 * fails (error, timeout, or malformed response), per the "Provider
 * failure" policy in docs/phase-8/ai-teacher-error-policy.md. This text
 * is the only thing ever shown to the student on provider failure; no
 * provider error text, status code, or response body is ever
 * substituted in its place.
 */
export const AI_PROVIDER_SAFE_FALLBACK_MESSAGE =
  "AI Teacher is unavailable right now, please try again in a moment.";
