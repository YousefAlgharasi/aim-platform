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
 *  within a single chat session.
 *
 *  Raised from 20 to 60: the structured lesson-delivery flow
 *  (LessonTeachingStageService) intentionally teaches one idea at a time
 *  with periodic comprehension questions rather than one long monologue,
 *  which uses more turns per lesson than the old free-form chat did. 20
 *  was getting hit mid-lesson, before the AI ever reached
 *  LESSON_COMPLETE, which surfaced as a generic "temporarily unavailable"
 *  error with no way to finish the lesson in that session. */
export const AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_SESSION = 60;

/** Maximum number of student AI Teacher turns (student messages) allowed
 *  per student across all sessions within a rolling 24-hour window. */
export const AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY = 200;

/** Maximum number of student AI Teacher turns (student messages) allowed
 *  per student across all sessions within a rolling 1-hour window. */
export const AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR = 60;

/** Minimum gap in milliseconds enforced between two consecutive student
 *  messages within the same session (debounce / spam protection). */
export const AI_TEACHER_RATE_LIMIT_MIN_TURN_GAP_MS = 1_000;
