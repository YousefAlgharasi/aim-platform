/**
 * P8-069: Add AI Teacher Rate Limit Policy — types.
 * Input and output contracts for the rate limit policy service.
 * No value here is a mastery/level/weakness/difficulty/recommendation/
 * review-schedule value (docs/phase-8/no-aim-replacement-rule.md).
 * No AI provider credential is referenced
 * (docs/phase-8/no-client-ai-provider-rule.md).
 */

/** Context passed to the rate limit policy for a single AI Teacher turn. */
export interface RateLimitCheckInput {
  /** Backend-resolved student identifier — never a client-trusted value. */
  readonly studentId: string;
  /** Backend-resolved session identifier — never a client-trusted value. */
  readonly sessionId: string;
}

/** Reason codes used in `RateLimitExceededError` so callers can map them
 *  to appropriate HTTP status details without re-parsing strings. */
export type RateLimitReason =
  | 'SESSION_TURN_LIMIT'
  | 'STUDENT_HOURLY_LIMIT'
  | 'STUDENT_DAILY_LIMIT'
  | 'MIN_TURN_GAP';
