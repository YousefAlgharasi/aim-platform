/**
 * P8-069: Add AI Teacher Rate Limit Policy — RateLimitExceededError.
 * Thrown by `RateLimitPolicyService` when any configured threshold is
 * breached.  Callers (e.g. `AiTeacherOrchestratorService`) catch this
 * and translate it into an appropriate HTTP 429 response; the error
 * never bubbles through to the Flutter client as an unhandled exception.
 */
import { RateLimitReason } from './rate-limit-policy.types';

export class RateLimitExceededError extends Error {
  readonly reason: RateLimitReason;
  readonly retryAfterSeconds: number | null;

  constructor(
    reason: RateLimitReason,
    message: string,
    retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = 'RateLimitExceededError';
    this.reason = reason;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
