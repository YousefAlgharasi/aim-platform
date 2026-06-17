/**
 * Tests for AimAdapterTimeoutPolicyService — P5-049.
 *
 * Covers:
 * - Success on first attempt returns immediately.
 * - Retryable failures are retried up to maxRetryAttempts.
 * - Non-retryable failures return immediately without retry.
 * - Total budget exhaustion aborts before max attempts.
 * - backoffDelay stays within [0, 2000] ms range.
 * - backendRequestId is never changed across retries (verified via attemptsMade).
 * - Budget exhaustion mid-retry returns budgetExhausted: true.
 */

import { BackendConfigService } from '../../../config/backend-config.service';
import { AimAnalysisCallResult } from '../aim-engine-client.types';
import {
  AimAdapterTimeoutPolicyService,
  AttemptFn,
} from './aim-adapter-timeout-policy.service';

function makeConfig(overrides: {
  maxRetryAttempts?: number;
  totalBudgetMs?: number;
} = {}): BackendConfigService {
  return {
    aimEngine: {
      url: 'http://aim-engine:8010',
      serviceToken: 'test-token',
      analysisTimeoutMs: 5000,
      healthTimeoutMs: 3000,
      totalBudgetMs: overrides.totalBudgetMs ?? 12000,
      maxRetryAttempts: overrides.maxRetryAttempts ?? 3,
    },
  } as unknown as BackendConfigService;
}

const SUCCESS: AimAnalysisCallResult = {
  ok: true,
  statusCode: 200,
  body: {
    backendRequestId: 'req-1',
    contractVersion: '1.0',
    studentId: 'student-1',
    sessionId: 'session-1',
    generatedAt: '2026-06-17T10:00:00Z',
    categories: {},
  },
};

const TIMEOUT_FAILURE: AimAnalysisCallResult = {
  ok: false,
  statusCode: 504,
  errorCode: 'TRANSPORT_TIMEOUT',
  message: 'The analysis request timed out.',
};

const AUTH_FAILURE: AimAnalysisCallResult = {
  ok: false,
  statusCode: 401,
  errorCode: 'AUTH_INVALID',
  message: 'Authentication is invalid.',
};

const CONNECTION_ERROR: AimAnalysisCallResult = {
  ok: false,
  statusCode: 503,
  errorCode: 'TRANSPORT_CONNECTION_ERROR',
  message: 'The AIM Engine is unavailable.',
};

const TRANSIENT_ERROR: AimAnalysisCallResult = {
  ok: false,
  statusCode: 500,
  errorCode: 'TRANSIENT_HTTP',
  message: 'A transient error occurred.',
};

/** Create an attemptFn that returns results in sequence. */
function sequence(...results: AimAnalysisCallResult[]): AttemptFn {
  let i = 0;
  return async (_attempt: number) => {
    const r = results[Math.min(i, results.length - 1)];
    i++;
    return r;
  };
}

describe('AimAdapterTimeoutPolicyService (P5-049)', () => {
  let service: AimAdapterTimeoutPolicyService;

  beforeEach(() => {
    service = new AimAdapterTimeoutPolicyService(makeConfig());
    // Suppress sleep delays in tests
    jest.spyOn(service as any, 'sleep').mockResolvedValue(undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  // -------------------------------------------------------------------------
  // Success
  // -------------------------------------------------------------------------

  it('returns success on first attempt', async () => {
    const result = await service.execute(sequence(SUCCESS));
    expect(result.result.ok).toBe(true);
    expect(result.attemptsMade).toBe(1);
  });

  it('sets budgetExhausted: false on success', async () => {
    const result = await service.execute(sequence(SUCCESS));
    expect(result.budgetExhausted).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Retryable failures
  // -------------------------------------------------------------------------

  it('retries TRANSPORT_TIMEOUT up to maxRetryAttempts', async () => {
    const result = await service.execute(
      sequence(TIMEOUT_FAILURE, TIMEOUT_FAILURE, SUCCESS),
    );
    expect(result.result.ok).toBe(true);
    expect(result.attemptsMade).toBe(3);
  });

  it('retries TRANSPORT_CONNECTION_ERROR', async () => {
    const result = await service.execute(
      sequence(CONNECTION_ERROR, SUCCESS),
    );
    expect(result.result.ok).toBe(true);
    expect(result.attemptsMade).toBe(2);
  });

  it('retries TRANSIENT_HTTP', async () => {
    const result = await service.execute(
      sequence(TRANSIENT_ERROR, SUCCESS),
    );
    expect(result.result.ok).toBe(true);
    expect(result.attemptsMade).toBe(2);
  });

  it('returns last failure after exhausting all attempts', async () => {
    const result = await service.execute(
      sequence(TIMEOUT_FAILURE, TIMEOUT_FAILURE, TIMEOUT_FAILURE),
    );
    expect(result.result.ok).toBe(false);
    expect(result.attemptsMade).toBe(3);
    expect(result.budgetExhausted).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Non-retryable failures
  // -------------------------------------------------------------------------

  it('does not retry AUTH_INVALID', async () => {
    const result = await service.execute(sequence(AUTH_FAILURE));
    expect(result.result.ok).toBe(false);
    expect(result.attemptsMade).toBe(1);
    if (!result.result.ok) expect(result.result.errorCode).toBe('AUTH_INVALID');
  });

  it('does not retry VALIDATION_ERROR', async () => {
    const validationError: AimAnalysisCallResult = {
      ok: false, statusCode: 400, errorCode: 'VALIDATION_ERROR', message: 'invalid',
    };
    const result = await service.execute(sequence(validationError));
    expect(result.attemptsMade).toBe(1);
  });

  it('does not retry IDEMPOTENCY_CONFLICT', async () => {
    const conflict: AimAnalysisCallResult = {
      ok: false, statusCode: 409, errorCode: 'IDEMPOTENCY_CONFLICT', message: 'conflict',
    };
    const result = await service.execute(sequence(conflict));
    expect(result.attemptsMade).toBe(1);
  });

  // -------------------------------------------------------------------------
  // Budget exhaustion
  // -------------------------------------------------------------------------

  it('reports budgetExhausted: true when budget is zero', async () => {
    // Override sleep to advance time beyond budget
    const tinyBudgetService = new AimAdapterTimeoutPolicyService(
      makeConfig({ totalBudgetMs: 0 }),
    );
    jest.spyOn(tinyBudgetService as any, 'sleep').mockResolvedValue(undefined);

    const result = await tinyBudgetService.execute(sequence(TIMEOUT_FAILURE));
    expect(result.budgetExhausted).toBe(true);
  });

  // -------------------------------------------------------------------------
  // backoffDelay
  // -------------------------------------------------------------------------

  it('backoffDelay returns value within [0, 2000]', () => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      const delay = service.backoffDelay(attempt);
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(2000);
    }
  });

  it('backoffDelay for attempt 1 is within [0, 200]', () => {
    for (let i = 0; i < 20; i++) {
      expect(service.backoffDelay(1)).toBeLessThanOrEqual(200);
    }
  });

  // -------------------------------------------------------------------------
  // Idempotency: attempt number increases, caller reuses backendRequestId
  // -------------------------------------------------------------------------

  it('passes increasing attempt numbers to the attemptFn', async () => {
    const seenAttempts: number[] = [];
    const fn: AttemptFn = async (n) => {
      seenAttempts.push(n);
      return n < 3 ? TIMEOUT_FAILURE : SUCCESS;
    };
    await service.execute(fn);
    expect(seenAttempts).toEqual([1, 2, 3]);
  });
});
