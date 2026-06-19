/**
 * P9-055: Add Voice Rate Limit Policy (Group F — Voice Orchestration With
 * Phase 8 AI Teacher). Fixed rate limit thresholds that protect system
 * cost and abuse risk for the voice teacher feature, mirroring the
 * Phase 8 AI Teacher text chat rate limit policy (P8-069).
 *
 * All limits are enforced backend-side in `VoiceRateLimitPolicyService`
 * before any STT/TTS/AI provider call is made. No limit value is ever
 * sent to the Flutter client; the client only receives a 429-shaped
 * error response when a limit is breached (handled by the API
 * controller layer).
 *
 * These are operational cost/abuse boundaries, not learning decisions —
 * they do not compute or alter mastery/level/weakness/difficulty/
 * recommendation/review-schedule values
 * (docs/phase-9/no-aim-authority-change-rule.md).
 */

/** Maximum number of voice turns allowed within a single voice session. */
export const VOICE_RATE_LIMIT_MAX_TURNS_PER_SESSION = 20;

/** Maximum number of voice turns allowed per student across all sessions
 *  within a rolling 24-hour window. */
export const VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY = 100;

/** Maximum number of voice turns allowed per student across all sessions
 *  within a rolling 1-hour window. */
export const VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR = 30;

/** Minimum gap in milliseconds enforced between two consecutive voice
 *  turns within the same session (debounce / spam protection). */
export const VOICE_RATE_LIMIT_MIN_TURN_GAP_MS = 1_000;
