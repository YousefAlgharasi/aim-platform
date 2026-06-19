/**
 * P9-055: Add Voice Rate Limit Policy — VoiceRateLimitExceededError.
 * Thrown by `VoiceRateLimitPolicyService` when any configured threshold
 * is breached. Callers (e.g. the voice orchestration pipeline) catch
 * this and translate it into an appropriate HTTP 429 response; the
 * error never bubbles through to the Flutter client as an unhandled
 * exception.
 */
import { VoiceRateLimitReason } from './voice-rate-limit-policy.types';

export class VoiceRateLimitExceededError extends Error {
  readonly reason: VoiceRateLimitReason;
  readonly retryAfterSeconds: number | null;

  constructor(
    reason: VoiceRateLimitReason,
    message: string,
    retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = 'VoiceRateLimitExceededError';
    this.reason = reason;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
