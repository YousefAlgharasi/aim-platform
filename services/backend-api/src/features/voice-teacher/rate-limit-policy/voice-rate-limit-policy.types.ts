/**
 * P9-055: Add Voice Rate Limit Policy — types.
 * Input and output contracts for the voice rate limit policy service.
 * No value here is a mastery/level/weakness/difficulty/recommendation/
 * review-schedule value (docs/phase-9/no-aim-authority-change-rule.md).
 * No STT/TTS/AI provider credential is referenced.
 */

/** Context passed to the rate limit policy for a single voice turn. */
export interface VoiceRateLimitCheckInput {
  /** Backend-resolved student identifier — never a client-trusted value. */
  readonly studentId: string;
  /** Backend-resolved voice session identifier — never a client-trusted value. */
  readonly sessionId: string;
}

/** Reason codes used in `VoiceRateLimitExceededError` so callers can map
 *  them to appropriate HTTP status details without re-parsing strings. */
export type VoiceRateLimitReason =
  | 'SESSION_TURN_LIMIT'
  | 'STUDENT_HOURLY_LIMIT'
  | 'STUDENT_DAILY_LIMIT'
  | 'MIN_TURN_GAP';
