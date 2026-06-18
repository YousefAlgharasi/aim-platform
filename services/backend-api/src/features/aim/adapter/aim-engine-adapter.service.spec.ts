/**
 * Integration tests for the AIM Engine adapter chain — P5-051.
 *
 * Tests the full adapter pipeline:
 *   AimEngineAdapterService.analyze()
 *     → AimAdapterTimeoutPolicyService (retry loop)
 *       → AimEngineClientService.postAnalysis() (HTTP)
 *     → AimResponseMapperService (validation + mapping)
 *     → AimAdapterErrorHandlerService (error classification + fallback)
 *
 * Verifies:
 * - Success path: valid 200 response mapped to AimValidatedResponse.
 * - HTTP failure path: retry then Profile A fallback.
 * - Response mapping failure: contract violation → Profile A fallback.
 * - No AIM-owned values computed or mutated in the adapter.
 * - No secrets or engine internals in error outputs.
 * - backendRequestId and correlation ids preserved across the chain.
 */

import { BackendConfigService } from '../../../config/backend-config.service';
import { AimEngineClientService } from '../aim-engine-client.service';
import { AimAnalysisRawRequest, AimAnalysisRawResponse } from '../aim-engine-client.types';
import { AimAdapterErrorHandlerService } from './aim-adapter-error-handler.service';
import { AimEngineAdapterService } from './aim-engine-adapter.service';
import { AimAdapterTimeoutPolicyService } from './aim-adapter-timeout-policy.service';
import { AimResponseMapperService } from './aim-response-mapper.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeConfig(): BackendConfigService {
  return {
    aimEngine: {
      url: 'http://aim-engine:8010',
      serviceToken: 'test-token',
      analysisTimeoutMs: 5000,
      healthTimeoutMs: 3000,
      totalBudgetMs: 12000,
      maxRetryAttempts: 3,
    },
  } as unknown as BackendConfigService;
}

function buildAdapter(clientMock: Partial<AimEngineClientService>): AimEngineAdapterService {
  const config = makeConfig();
  const client = clientMock as AimEngineClientService;
  const retryPolicy = new AimAdapterTimeoutPolicyService(config);
  jest.spyOn(retryPolicy as any, 'sleep').mockResolvedValue(undefined);
  const responseMapper = new AimResponseMapperService();
  const errorHandler = new AimAdapterErrorHandlerService();
  return new AimEngineAdapterService(client, retryPolicy, responseMapper, errorHandler);
}

const VALID_REQUEST: AimAnalysisRawRequest = {
  backendRequestId: '550e8400-e29b-41d4-a716-446655440000',
  session: {
    sessionId: '660e8400-e29b-41d4-a716-446655440001',
    studentId: '770e8400-e29b-41d4-a716-446655440002',
  } as any,
  attempts: [],
} as any;

const VALID_RAW_RESPONSE: AimAnalysisRawResponse = {
  backendRequestId: '550e8400-e29b-41d4-a716-446655440000',
  contractVersion: '1.0',
  studentId: '770e8400-e29b-41d4-a716-446655440002',
  sessionId: '660e8400-e29b-41d4-a716-446655440001',
  generatedAt: '2026-06-17T10:00:00Z',
  categories: {},
};

// ---------------------------------------------------------------------------
// Success path
// ---------------------------------------------------------------------------

describe('AimEngineAdapterService — integration (P5-051)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns ok: true with AimValidatedResponse on successful 200', async () => {
    const adapter = buildAdapter({
      postAnalysis: jest.fn().mockResolvedValue({
        ok: true, statusCode: 200, body: VALID_RAW_RESPONSE,
      }),
    });

    const result = await adapter.analyze(VALID_REQUEST, 'req-1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.response.backendRequestId).toBe(VALID_REQUEST.backendRequestId);
      expect(result.response.studentId).toBe('770e8400-e29b-41d4-a716-446655440002');
    }
  });

  it('response categories are typed (empty arrays for absent categories)', async () => {
    const adapter = buildAdapter({
      postAnalysis: jest.fn().mockResolvedValue({
        ok: true, statusCode: 200, body: VALID_RAW_RESPONSE,
      }),
    });

    const result = await adapter.analyze(VALID_REQUEST, 'req-1');
    if (!result.ok) fail('expected ok');
    expect(Array.isArray(result.response.categories.skillState)).toBe(true);
    expect(Array.isArray(result.response.categories.weaknessRecords)).toBe(true);
    expect(result.response.categories.difficultyDecision).toBeNull();
  });

  // -------------------------------------------------------------------------
  // HTTP failure path
  // -------------------------------------------------------------------------

  it('returns ok: false with Profile A fallback on transport failure', async () => {
    const adapter = buildAdapter({
      postAnalysis: jest.fn().mockResolvedValue({
        ok: false, statusCode: 504,
        errorCode: 'TRANSPORT_TIMEOUT', message: 'timeout',
      }),
    });

    const result = await adapter.analyze(VALID_REQUEST, 'req-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fallback.profile).toBe('A');
      expect(result.fallback.rawInputSaved).toBe(true);
      expect(result.error.category).toBe('transport_timeout');
    }
  });

  it('retries on TRANSPORT_TIMEOUT and succeeds on third attempt', async () => {
    const postAnalysis = jest.fn()
      .mockResolvedValueOnce({ ok: false, statusCode: 504, errorCode: 'TRANSPORT_TIMEOUT', message: 'timeout' })
      .mockResolvedValueOnce({ ok: false, statusCode: 504, errorCode: 'TRANSPORT_TIMEOUT', message: 'timeout' })
      .mockResolvedValueOnce({ ok: true, statusCode: 200, body: VALID_RAW_RESPONSE });

    const adapter = buildAdapter({ postAnalysis });
    const result = await adapter.analyze(VALID_REQUEST, 'req-1');

    expect(result.ok).toBe(true);
    expect(postAnalysis).toHaveBeenCalledTimes(3);
  });

  it('does not retry AUTH_INVALID', async () => {
    const postAnalysis = jest.fn().mockResolvedValue({
      ok: false, statusCode: 401, errorCode: 'AUTH_INVALID', message: 'auth failed',
    });

    const adapter = buildAdapter({ postAnalysis });
    const result = await adapter.analyze(VALID_REQUEST, 'req-1');

    expect(result.ok).toBe(false);
    expect(postAnalysis).toHaveBeenCalledTimes(1);
    if (!result.ok) expect(result.error.category).toBe('authentication_failure');
  });

  // -------------------------------------------------------------------------
  // Mapping failure path
  // -------------------------------------------------------------------------

  it('returns ok: false with contract_violation when response correlation mismatches', async () => {
    const mismatchedResponse = {
      ...VALID_RAW_RESPONSE,
      backendRequestId: 'completely-different-id',
    };

    const adapter = buildAdapter({
      postAnalysis: jest.fn().mockResolvedValue({
        ok: true, statusCode: 200, body: mismatchedResponse,
      }),
    });

    const result = await adapter.analyze(VALID_REQUEST, 'req-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.category).toBe('contract_violation');
      expect(result.fallback.profile).toBe('A');
    }
  });

  it('returns ok: false when contractVersion is unsupported', async () => {
    const badVersionResponse = { ...VALID_RAW_RESPONSE, contractVersion: '99.0' };

    const adapter = buildAdapter({
      postAnalysis: jest.fn().mockResolvedValue({
        ok: true, statusCode: 200, body: badVersionResponse,
      }),
    });

    const result = await adapter.analyze(VALID_REQUEST, 'req-1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.category).toBe('contract_violation');
  });

  // -------------------------------------------------------------------------
  // Security
  // -------------------------------------------------------------------------

  it('error output contains no secrets or engine internals on failure', async () => {
    const adapter = buildAdapter({
      postAnalysis: jest.fn().mockResolvedValue({
        ok: false, statusCode: 500, errorCode: 'INTERNAL_ERROR', message: 'internal error',
      }),
    });

    const result = await adapter.analyze(VALID_REQUEST, 'req-1');
    const json = JSON.stringify(result).toLowerCase();

    for (const forbidden of ['token', 'secret', 'password', 'database', 'traceback', 'stack_trace']) {
      expect(json).not.toContain(forbidden);
    }
  });

  it('does not include mastery, weakness, or difficulty in the request sent to the engine', async () => {
    let capturedRequest: AimAnalysisRawRequest | null = null;
    const adapter = buildAdapter({
      postAnalysis: jest.fn().mockImplementation(async (req: AimAnalysisRawRequest) => {
        capturedRequest = req;
        return { ok: true, statusCode: 200, body: VALID_RAW_RESPONSE };
      }),
    });

    await adapter.analyze(VALID_REQUEST, 'req-1');

    const reqJson = JSON.stringify(capturedRequest).toLowerCase();
    expect(reqJson).not.toContain('mastery');
    expect(reqJson).not.toContain('weakness');
    expect(reqJson).not.toContain('nextdifficulty');
    expect(reqJson).not.toContain('recommendation');
  });
});
