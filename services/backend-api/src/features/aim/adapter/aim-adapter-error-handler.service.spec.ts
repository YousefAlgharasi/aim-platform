/**
 * Tests for AimAdapterErrorHandlerService — P5-050.
 *
 * Covers:
 * - classifyRetryOutcome: correct category and retryable for all error types.
 * - classifyRetryOutcome: budget exhaustion → BUDGET_EXHAUSTED category.
 * - classifyMappingFailure: contract violations classified correctly.
 * - applyFallbackA: rawInputSaved: true, error embedded, no internals leaked.
 * - applyFallbackB: lastPersistedValue echoed, isEmpty flag correct.
 * - No secrets, stack traces, or engine internals in any output.
 */

import { AimAdapterErrorHandlerService } from './aim-adapter-error-handler.service';
import { AimRetryOutcome } from './aim-adapter-timeout-policy.service';
import { AimResponseMappingResult } from './aim-response-mapper.types';

function makeOutcome(
  errorCode: string,
  statusCode = 500,
  budgetExhausted = false,
  attemptsMade = 1,
): AimRetryOutcome {
  return {
    result: {
      ok: false,
      statusCode,
      errorCode,
      message: `safe message for ${errorCode}`,
    },
    attemptsMade,
    budgetExhausted,
  };
}

function makeSuccessOutcome(): AimRetryOutcome {
  return {
    result: {
      ok: true,
      statusCode: 200,
      body: {} as any,
    },
    attemptsMade: 1,
    budgetExhausted: false,
  };
}

describe('AimAdapterErrorHandlerService (P5-050)', () => {
  let service: AimAdapterErrorHandlerService;

  beforeEach(() => {
    service = new AimAdapterErrorHandlerService();
  });

  // -------------------------------------------------------------------------
  // classifyRetryOutcome — categories
  // -------------------------------------------------------------------------

  it('classifies TRANSPORT_TIMEOUT as transport_timeout', () => {
    const err = service.classifyRetryOutcome(makeOutcome('TRANSPORT_TIMEOUT', 504));
    expect(err.category).toBe('transport_timeout');
  });

  it('classifies TRANSPORT_CONNECTION_ERROR as transport_connection_error', () => {
    const err = service.classifyRetryOutcome(makeOutcome('TRANSPORT_CONNECTION_ERROR', 503));
    expect(err.category).toBe('transport_connection_error');
  });

  it('classifies TRANSIENT_HTTP as transient_http', () => {
    const err = service.classifyRetryOutcome(makeOutcome('TRANSIENT_HTTP', 500));
    expect(err.category).toBe('transient_http');
  });

  it('classifies AUTH_INVALID as authentication_failure', () => {
    const err = service.classifyRetryOutcome(makeOutcome('AUTH_INVALID', 401));
    expect(err.category).toBe('authentication_failure');
  });

  it('classifies FORBIDDEN as authorization_failure', () => {
    const err = service.classifyRetryOutcome(makeOutcome('FORBIDDEN', 403));
    expect(err.category).toBe('authorization_failure');
  });

  it('classifies VALIDATION_ERROR as validation_failure', () => {
    const err = service.classifyRetryOutcome(makeOutcome('VALIDATION_ERROR', 400));
    expect(err.category).toBe('validation_failure');
  });

  it('classifies IDEMPOTENCY_CONFLICT as idempotency_conflict', () => {
    const err = service.classifyRetryOutcome(makeOutcome('IDEMPOTENCY_CONFLICT', 409));
    expect(err.category).toBe('idempotency_conflict');
  });

  it('classifies unknown error codes as internal_error', () => {
    const err = service.classifyRetryOutcome(makeOutcome('SOMETHING_NEW', 500));
    expect(err.category).toBe('internal_error');
  });

  // -------------------------------------------------------------------------
  // classifyRetryOutcome — retryable flag
  // -------------------------------------------------------------------------

  it.each([
    ['TRANSPORT_TIMEOUT', true],
    ['TRANSPORT_CONNECTION_ERROR', true],
    ['TRANSIENT_HTTP', true],
    ['AUTH_INVALID', false],
    ['VALIDATION_ERROR', false],
    ['IDEMPOTENCY_CONFLICT', false],
  ])('%s retryable: %s', (code, expected) => {
    const err = service.classifyRetryOutcome(makeOutcome(code));
    expect(err.retryable).toBe(expected);
  });

  // -------------------------------------------------------------------------
  // Budget exhaustion
  // -------------------------------------------------------------------------

  it('classifies budget exhaustion as budget_exhausted, not retryable', () => {
    const outcome: AimRetryOutcome = {
      result: {
        ok: false, statusCode: 504,
        errorCode: 'TRANSPORT_TIMEOUT', message: 'timeout',
      },
      attemptsMade: 3,
      budgetExhausted: true,
    };
    const err = service.classifyRetryOutcome(outcome);
    expect(err.category).toBe('budget_exhausted');
    expect(err.retryable).toBe(false);
    expect(err.code).toBe('BUDGET_EXHAUSTED');
  });

  // -------------------------------------------------------------------------
  // classifyMappingFailure
  // -------------------------------------------------------------------------

  it('classifies mapping failure as contract_violation', () => {
    const failure: AimResponseMappingResult & { ok: false } = {
      ok: false,
      failureCode: 'CORRELATION_MISMATCH',
      reason: 'backendRequestId mismatch',
    };
    const err = service.classifyMappingFailure(failure);
    expect(err.category).toBe('contract_violation');
    expect(err.code).toBe('CORRELATION_MISMATCH');
    expect(err.retryable).toBe(false);
  });

  // -------------------------------------------------------------------------
  // applyFallbackA
  // -------------------------------------------------------------------------

  it('applyFallbackA returns profile A with rawInputSaved: true', () => {
    const err = service.classifyRetryOutcome(makeOutcome('TRANSPORT_TIMEOUT', 504));
    const fallback = service.applyFallbackA(err);
    expect(fallback.profile).toBe('A');
    expect(fallback.rawInputSaved).toBe(true);
    expect(fallback.error).toBe(err);
  });

  it('applyFallbackA output contains no secrets or internals', () => {
    const err = service.classifyRetryOutcome(makeOutcome('TRANSPORT_TIMEOUT'));
    const fallback = service.applyFallbackA(err);
    const json = JSON.stringify(fallback).toLowerCase();
    for (const forbidden of ['token', 'secret', 'password', 'database', 'stack']) {
      expect(json).not.toContain(forbidden);
    }
  });

  // -------------------------------------------------------------------------
  // applyFallbackB
  // -------------------------------------------------------------------------

  it('applyFallbackB returns profile B with null lastPersistedValue', () => {
    const err = service.classifyRetryOutcome(makeOutcome('TRANSPORT_TIMEOUT'));
    const fallback = service.applyFallbackB(err, null);
    expect(fallback.profile).toBe('B');
    expect(fallback.lastPersistedValue).toBeNull();
    expect(fallback.isEmpty).toBe(true);
  });

  it('applyFallbackB echoes lastPersistedValue when provided', () => {
    const err = service.classifyRetryOutcome(makeOutcome('TRANSPORT_TIMEOUT'));
    const persisted = { masteryScore: 0.72 };
    const fallback = service.applyFallbackB(err, persisted);
    expect(fallback.lastPersistedValue).toBe(persisted);
    expect(fallback.isEmpty).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Output safety
  // -------------------------------------------------------------------------

  it('error timestamp is a valid ISO string', () => {
    const err = service.classifyRetryOutcome(makeOutcome('TRANSPORT_TIMEOUT'));
    expect(() => new Date(err.timestamp)).not.toThrow();
    expect(new Date(err.timestamp).toISOString()).toBe(err.timestamp);
  });

  it('error message is user-safe (no engine internals)', () => {
    const err = service.classifyRetryOutcome(makeOutcome('INTERNAL_ERROR'));
    expect(err.message.toLowerCase()).not.toContain('stack');
    expect(err.message.toLowerCase()).not.toContain('token');
  });
});
