/**
 * P8-069: Add AI Teacher Rate Limit Policy (Group G — AI Teacher Backend
 * Pipeline). Fixed rate limit thresholds that protect system cost and
 * abuse risk for the AI Teacher text chat feature.
 *
 * All limits are enforced backend-side in `RateLimitPolicyService` before
 * any AI provider call is made.  No limit value is ever sent to the
 * Flutter client; the client only receives a 429-shaped error response
 * when a limit is breached (handled by the API controller layer).
 *
 * These are operational cost/abuse boundaries, not learning decisions —
 * they do not compute or alter mastery/level/weakness/difficulty/
 * recommendation/review-schedule values
 * (docs/phase-8/no-aim-replacement-rule.md).
 */

/** Maximum number of student AI Teacher turns (student messages) allowed
 *  within a single chat session. */
export const AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_SESSION = 20;

/** Maximum number of student AI Teacher turns (student messages) allowed
 *  per student across all sessions within a rolling 24-hour window. */
export const AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY = 100;

/** Maximum number of student AI Teacher turns (student messages) allowed
 *  per student across all sessions within a rolling 1-hour window. */
export const AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR = 30;

/** Minimum gap in milliseconds enforced between two consecutive student
 *  messages within the same session (debounce / spam protection). */
export const AI_TEACHER_RATE_LIMIT_MIN_TURN_GAP_MS = 1_000;
