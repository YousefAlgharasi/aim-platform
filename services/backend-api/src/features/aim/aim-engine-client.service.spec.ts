/**
 * Tests for the AIM Engine HTTP client — P5-045.
 *
 * Verifies:
 * - postAnalysis() sends to the correct URL with required headers.
 * - Service token appears in Authorization header (never in logs/errors).
 * - 200 response returns ok: true with parsed body.
 * - Non-200 responses return ok: false with errorCode and safe message.
 * - Timeout errors return ok: false with TRANSPORT_TIMEOUT.
 * - Connection errors return ok: false with TRANSPORT_CONNECTION_ERROR.
 * - Request body is never included in error return values.
 */

import { BackendConfigService } from '../../config/backend-config.service';
import { AimEngineClientService } from './aim-engine-client.service';

/** Minimal config double for tests. */
function makeConfig(overrides: Partial<{
  url: string;
  serviceToken: string;
  analysisTimeoutMs: number;
  healthTimeoutMs: number;
  totalBudgetMs: number;
  maxRetryAttempts: number;
}> = {}): BackendConfigService {
  return {
    aimEngine: {
      url: overrides.url ?? 'http://aim-engine:8010',
      serviceToken: overrides.serviceToken ?? 'test-token',
      analysisTimeoutMs: overrides.analysisTimeoutMs ?? 5000,
      healthTimeoutMs: overrides.healthTimeoutMs ?? 3000,
      totalBudgetMs: overrides.totalBudgetMs ?? 12000,
      maxRetryAttempts: overrides.maxRetryAttempts ?? 3,
    },
  } as unknown as BackendConfigService;
}

const VALID_REQUEST = {
  backendRequestId: '550e8400-e29b-41d4-a716-446655440000',
  session: { sessionId: 'session-1', studentId: 'student-1' },
  attempts: [],
};

const VALID_RESPONSE = {
  backendRequestId: '550e8400-e29b-41d4-a716-446655440000',
  contractVersion: '1.0',
  studentId: 'student-1',
  sessionId: 'session-1',
  generatedAt: '2026-06-17T10:00:00Z',
  categories: {},
};

describe('AimEngineClientService — postAnalysis (P5-045)', () => {
  let client: AimEngineClientService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    client = new AimEngineClientService(makeConfig());
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Correct URL and headers
  // -------------------------------------------------------------------------

  it('sends POST to /aim/v1/analysis', async () => {
    fetchSpy.mockResolvedValueOnce({
      status: 200,
      json: async () => VALID_RESPONSE,
    } as Response);

    await client.postAnalysis(VALID_REQUEST, 'req-1');

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://aim-engine:8010/aim/v1/analysis',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('includes Authorization Bearer token in headers', async () => {
    fetchSpy.mockResolvedValueOnce({
      status: 200,
      json: async () => VALID_RESPONSE,
    } as Response);

    await client.postAnalysis(VALID_REQUEST, 'req-1');

    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer test-token');
  });

  it('includes X-Request-Id in headers', async () => {
    fetchSpy.mockResolvedValueOnce({
      status: 200,
      json: async () => VALID_RESPONSE,
    } as Response);

    await client.postAnalysis(VALID_REQUEST, 'my-request-id');

    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['X-Request-Id']).toBe('my-request-id');
  });

  it('sets Content-Type: application/json', async () => {
    fetchSpy.mockResolvedValueOnce({
      status: 200,
      json: async () => VALID_RESPONSE,
    } as Response);

    await client.postAnalysis(VALID_REQUEST, 'req-1');

    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('sets Cache-Control via contract version header', async () => {
    fetchSpy.mockResolvedValueOnce({
      status: 200,
      json: async () => VALID_RESPONSE,
    } as Response);

    await client.postAnalysis(VALID_REQUEST, 'req-1');

    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['X-Contract-Version']).toBe('1.0');
  });

  // -------------------------------------------------------------------------
  // Successful 200 response
  // -------------------------------------------------------------------------

  it('returns ok: true with parsed body on 200', async () => {
    fetchSpy.mockResolvedValueOnce({
      status: 200,
      json: async () => VALID_RESPONSE,
    } as Response);

    const result = await client.postAnalysis(VALID_REQUEST, 'req-1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.statusCode).toBe(200);
      expect(result.body.backendRequestId).toBe(VALID_RESPONSE.backendRequestId);
    }
  });

  // -------------------------------------------------------------------------
  // Non-200 responses
  // -------------------------------------------------------------------------

  it('returns ok: false with statusCode on 400', async () => {
    fetchSpy.mockResolvedValueOnce({
      status: 400,
      json: async () => ({ code: 'VALIDATION_ERROR', message: 'invalid input' }),
    } as Response);

    const result = await client.postAnalysis(VALID_REQUEST, 'req-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.statusCode).toBe(400);
      expect(result.errorCode).toBe('VALIDATION_ERROR');
    }
  });

  it('returns ok: false on 401', async () => {
    fetchSpy.mockResolvedValueOnce({
      status: 401,
      json: async () => ({ code: 'AUTH_INVALID', message: 'invalid token' }),
    } as Response);

    const result = await client.postAnalysis(VALID_REQUEST, 'req-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.statusCode).toBe(401);
    }
  });

  it('returns ok: false with fallback code when error body is unparseable', async () => {
    fetchSpy.mockResolvedValueOnce({
      status: 500,
      json: async () => { throw new Error('not json'); },
    } as unknown as Response);

    const result = await client.postAnalysis(VALID_REQUEST, 'req-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.statusCode).toBe(500);
      expect(result.errorCode).toBeTruthy();
    }
  });

  // -------------------------------------------------------------------------
  // Timeout
  // -------------------------------------------------------------------------

  it('returns TRANSPORT_TIMEOUT on AbortSignal timeout', async () => {
    fetchSpy.mockRejectedValueOnce(
      Object.assign(new DOMException('Timeout', 'TimeoutError'), {}),
    );

    const result = await client.postAnalysis(VALID_REQUEST, 'req-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorCode).toBe('TRANSPORT_TIMEOUT');
      expect(result.statusCode).toBe(504);
    }
  });

  // -------------------------------------------------------------------------
  // Connection error
  // -------------------------------------------------------------------------

  it('returns TRANSPORT_CONNECTION_ERROR on network failure', async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError('fetch failed'));

    const result = await client.postAnalysis(VALID_REQUEST, 'req-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorCode).toBe('TRANSPORT_CONNECTION_ERROR');
      expect(result.statusCode).toBe(503);
    }
  });

  // -------------------------------------------------------------------------
  // Security: service token must not appear in error return values
  // -------------------------------------------------------------------------

  it('does not include service token in failure result fields', async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError('fetch failed'));

    const result = await client.postAnalysis(VALID_REQUEST, 'req-1');

    const resultJson = JSON.stringify(result);
    expect(resultJson).not.toContain('test-token');
  });

  it('does not include request body in failure result fields', async () => {
    fetchSpy.mockResolvedValueOnce({
      status: 500,
      json: async () => ({ code: 'INTERNAL_ERROR', message: 'error' }),
    } as Response);

    const result = await client.postAnalysis(VALID_REQUEST, 'req-1');

    const resultJson = JSON.stringify(result);
    // Raw request payload must not bleed into the result
    expect(resultJson).not.toContain('"session"');
    expect(resultJson).not.toContain('"attempts"');
  });

  // -------------------------------------------------------------------------
  // Existing health check not broken
  // -------------------------------------------------------------------------

  it('checkHealth still works after P5-045 changes', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        service: 'aim-engine',
        status: 'ok',
        timestamp: '2026-06-17T10:00:00Z',
        uptime_seconds: 42,
        phase: 'phase-5-aim-integration',
        environment: 'local',
      }),
    } as Response);

    const result = await client.checkHealth();

    expect(result.reachable).toBe(true);
  });
});
