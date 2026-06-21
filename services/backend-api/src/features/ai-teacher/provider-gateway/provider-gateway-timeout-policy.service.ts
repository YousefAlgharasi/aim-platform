/**
 * P8-057: AI Provider Timeout Policy (Group F — AI Provider Gateway).
 * Wraps a single AI Teacher provider call attempt with a per-attempt
 * hard timeout, a small bounded retry count, exponential backoff with
 * jitter, and a total time budget, protecting student-facing chat
 * latency from a slow or failing provider.
 *
 * This service does not call the AI provider itself — it delegates each
 * attempt to a caller-supplied function (the concrete AiProviderGateway
 * implementation), keeping the policy testable without real HTTP calls
 * and without ever touching provider credentials
 * (docs/phase-8/no-client-ai-provider-rule.md). It never computes or
 * alters a mastery/level/weakness/difficulty/recommendation/review-
 * schedule value (docs/phase-8/no-aim-replacement-rule.md).
 *
 * Only `timeout` and `error` statuses are retried; `success` returns
 * immediately on the first attempt that produces it.
 */
import { Injectable, Logger } from '@nestjs/common';

import { AiProviderResponse } from './provider-gateway.types';
import {
  AI_PROVIDER_BACKOFF_BASE_MS,
  AI_PROVIDER_BACKOFF_CAP_MS,
  AI_PROVIDER_CALL_TIMEOUT_MS,
  AI_PROVIDER_MAX_ATTEMPTS,
  AI_PROVIDER_TOTAL_BUDGET_MS,
} from './provider-gateway-timeout.constants';

export interface ProviderRetryOutcome {
  readonly response: AiProviderResponse;
  readonly attemptsMade: number;
  readonly budgetExhausted: boolean;
}

export type ProviderAttemptFn = (attemptNumber: number) => Promise<AiProviderResponse>;

const TIMEOUT_RESPONSE: Omit<AiProviderResponse, 'latencyMs'> = {
  status: 'timeout',
  text: null,
  provider: 'unknown',
  model: 'unknown',
  errorCategory: 'PROVIDER_CALL_TIMEOUT',
};

@Injectable()
export class ProviderGatewayTimeoutPolicyService {
  private readonly logger = new Logger(ProviderGatewayTimeoutPolicyService.name);

  async execute(attemptFn: ProviderAttemptFn): Promise<ProviderRetryOutcome> {
    const budgetStart = Date.now();
    let attemptsMade = 0;
    let lastResponse: AiProviderResponse | null = null;

    for (let attempt = 1; attempt <= AI_PROVIDER_MAX_ATTEMPTS; attempt++) {
      const elapsed = Date.now() - budgetStart;
      if (elapsed >= AI_PROVIDER_TOTAL_BUDGET_MS) {
        this.logger.warn(`AI provider total budget exhausted after ${elapsed}ms`);
        return {
          response: lastResponse ?? { ...TIMEOUT_RESPONSE, latencyMs: elapsed },
          attemptsMade,
          budgetExhausted: true,
        };
      }

      attemptsMade = attempt;
      const response = await this.runWithTimeout(() => attemptFn(attempt));
      lastResponse = response;

      if (response.status === 'success') {
        return { response, attemptsMade, budgetExhausted: false };
      }

      if (attempt < AI_PROVIDER_MAX_ATTEMPTS) {
        const remaining = AI_PROVIDER_TOTAL_BUDGET_MS - (Date.now() - budgetStart);
        if (remaining <= 0) {
          return { response, attemptsMade, budgetExhausted: true };
        }
        const delayMs = Math.min(this.backoffDelay(attempt), remaining);
        this.logger.debug(
          `AI provider attempt ${attempt} failed (${response.status}), retrying after ${delayMs}ms`,
        );
        await this.sleep(delayMs);
      }
    }

    return { response: lastResponse!, attemptsMade, budgetExhausted: false };
  }

  private async runWithTimeout(fn: () => Promise<AiProviderResponse>): Promise<AiProviderResponse> {
    const start = Date.now();
    let timeoutHandle: NodeJS.Timeout;

    const timeoutPromise = new Promise<AiProviderResponse>((resolve) => {
      timeoutHandle = setTimeout(() => {
        resolve({ ...TIMEOUT_RESPONSE, latencyMs: Date.now() - start });
      }, AI_PROVIDER_CALL_TIMEOUT_MS);
    });

    try {
      return await Promise.race([fn(), timeoutPromise]);
    } finally {
      clearTimeout(timeoutHandle!);
    }
  }

  private backoffDelay(attempt: number): number {
    const exponential = AI_PROVIDER_BACKOFF_BASE_MS * Math.pow(2, attempt - 1);
    const capped = Math.min(exponential, AI_PROVIDER_BACKOFF_CAP_MS);
    return Math.floor(Math.random() * capped);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
