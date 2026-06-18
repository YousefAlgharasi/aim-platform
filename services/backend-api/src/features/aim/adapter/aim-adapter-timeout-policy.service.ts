/**
 * AIM Adapter Timeout Policy — Phase 5, P5-049.
 *
 * Wraps a single AIM Engine analysis call with the retry, backoff, and total
 * budget policy defined in docs/phase-5/aim-error-handling-policy.md (P5-008).
 *
 * Policy summary (from P5-008):
 *   Max attempts:     3 (initial + 2 retries)
 *   Backoff:          Exponential with full jitter. Base 200 ms, cap 2 000 ms.
 *   Idempotency:      backendRequestId is reused on every retry.
 *   Total budget:     12 000 ms (configurable via P5-044 config).
 *   Retryable codes:  TRANSPORT_TIMEOUT, TRANSPORT_CONNECTION_ERROR, TRANSIENT_HTTP.
 *   Non-retryable:    All other error codes (AUTH_INVALID, VALIDATION_ERROR, etc.).
 *
 * This service does not call the AIM Engine directly. It delegates each
 * attempt to a caller-supplied function, keeping the policy testable without
 * real HTTP calls.
 *
 * Scope rules:
 * - Only the AIM adapter calls this service (Backend-only AIM access).
 * - No mastery, level, weakness, difficulty, or any AIM-owned learning value
 *   is computed or altered by retry logic.
 * - No secrets, service-role keys, or AI provider keys are referenced here.
 * - The backendRequestId is never changed across retries (idempotency rule).
 */
import { Injectable, Logger } from '@nestjs/common';
import { BackendConfigService } from '../../../config/backend-config.service';
import { AimAnalysisCallResult } from '../aim-engine-client.types';

/** Error codes that are safe to retry per P5-008. */
const RETRYABLE_CODES = new Set([
  'TRANSPORT_TIMEOUT',
  'TRANSPORT_CONNECTION_ERROR',
  'TRANSIENT_HTTP',
]);

export interface AimRetryOutcome {
  /** Final result after all attempts (or earlier non-retryable failure). */
  readonly result: AimAnalysisCallResult;
  /** Total number of attempts made (1 = no retry). */
  readonly attemptsMade: number;
  /** Whether the budget was exhausted before the max attempts were reached. */
  readonly budgetExhausted: boolean;
}

export type AttemptFn = (attemptNumber: number) => Promise<AimAnalysisCallResult>;

@Injectable()
export class AimAdapterTimeoutPolicyService {
  private readonly logger = new Logger(AimAdapterTimeoutPolicyService.name);

  constructor(private readonly config: BackendConfigService) {}

  /**
   * Execute the AIM analysis call with the P5-008 retry policy.
   *
   * @param attemptFn   A function that performs one HTTP attempt and returns
   *                    AimAnalysisCallResult. Receives the 1-based attempt number.
   *                    The same backendRequestId must be used across all attempts
   *                    (enforced by the caller; idempotency is a contract rule).
   */
  async execute(attemptFn: AttemptFn): Promise<AimRetryOutcome> {
    const maxAttempts = this.config.aimEngine.maxRetryAttempts;
    const totalBudgetMs = this.config.aimEngine.totalBudgetMs;
    const budgetStart = Date.now();

    let attemptsMade = 0;
    let lastResult: AimAnalysisCallResult | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Check remaining budget before each attempt
      const elapsed = Date.now() - budgetStart;
      if (elapsed >= totalBudgetMs) {
        this.logger.warn('AIM adapter total budget exhausted', {
          attempt,
          elapsedMs: elapsed,
          budgetMs: totalBudgetMs,
        });
        return {
          result: lastResult ?? {
            ok: false,
            statusCode: 504,
            errorCode: 'TRANSPORT_TIMEOUT',
            message: 'The analysis request timed out.',
          },
          attemptsMade,
          budgetExhausted: true,
        };
      }

      attemptsMade = attempt;

      this.logger.debug('AIM analysis attempt', { attempt, maxAttempts });

      const result = await attemptFn(attempt);
      lastResult = result;

      // Success — return immediately
      if (result.ok) {
        return { result, attemptsMade, budgetExhausted: false };
      }

      // Non-retryable failure — return immediately
      if (!RETRYABLE_CODES.has(result.errorCode)) {
        this.logger.warn('AIM analysis non-retryable failure', {
          attempt,
          errorCode: result.errorCode,
          statusCode: result.statusCode,
        });
        return { result, attemptsMade, budgetExhausted: false };
      }

      // Retryable — apply backoff unless this was the last attempt
      if (attempt < maxAttempts) {
        const delayMs = this.backoffDelay(attempt);
        const remaining = totalBudgetMs - (Date.now() - budgetStart);

        if (remaining <= 0) {
          return { result: lastResult, attemptsMade, budgetExhausted: true };
        }

        const actualDelay = Math.min(delayMs, remaining);
        this.logger.debug('AIM analysis retry backoff', {
          attempt,
          delayMs: actualDelay,
          errorCode: result.errorCode,
        });
        await this.sleep(actualDelay);
      }
    }

    // All attempts exhausted
    return { result: lastResult!, attemptsMade, budgetExhausted: false };
  }

  /**
   * Compute exponential backoff with full jitter per P5-008:
   *   base = 200 ms, cap = 2 000 ms.
   *   delay = random(0, min(cap, base * 2^(attempt-1)))
   */
  backoffDelay(attempt: number): number {
    const BASE_MS = 200;
    const CAP_MS = 2_000;
    const exponential = BASE_MS * Math.pow(2, attempt - 1);
    const capped = Math.min(exponential, CAP_MS);
    return Math.floor(Math.random() * capped);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
