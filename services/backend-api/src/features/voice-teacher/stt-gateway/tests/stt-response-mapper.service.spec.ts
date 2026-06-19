// P9-046: Add STT Provider Tests — SttResponseMapperService.
// Verifies that the response mapper (P9-041) converts raw provider
// responses into the internal SttProviderResponse contract without
// leaking raw provider data or AIM fields, and handles error/missing
// response paths correctly.

import { SttResponseMapperService } from '../stt-response.mapper';

describe('SttResponseMapperService', () => {
  let svc: SttResponseMapperService;

  beforeEach(() => {
    svc = new SttResponseMapperService();
  });

  // -------------------------------------------------------------------------
  // Success path
  // -------------------------------------------------------------------------

  it('returns status=success with transcript when raw.text is a non-empty string', () => {
    const result = svc.mapResponse({
      latencyMs: 400,
      raw: { text: 'Hello world', durationMs: 2000 },
    });

    expect(result.status).toBe('success');
    expect(result.transcript).toBe('Hello world');
    expect(result.durationMs).toBe(2000);
  });

  it('uses latencyMs as durationMs fallback when raw.durationMs is null', () => {
    const result = svc.mapResponse({
      latencyMs: 350,
      raw: { text: 'test', durationMs: null },
    });

    expect(result.status).toBe('success');
    expect(result.durationMs).toBe(350);
  });

  it('returns status=success for an empty transcript (silent/empty recording is not a mapper error)', () => {
    const result = svc.mapResponse({
      latencyMs: 100,
      raw: { text: '', durationMs: 500 },
    });

    expect(result.status).toBe('success');
    expect(result.transcript).toBe('');
  });

  // -------------------------------------------------------------------------
  // Error paths
  // -------------------------------------------------------------------------

  it('returns status=error when raw is null', () => {
    const result = svc.mapResponse({ latencyMs: 100, raw: null });

    expect(result.status).toBe('error');
    expect(result.transcript).toBeNull();
    expect(result.errorCategory).toBe('STT_PROVIDER_CALL_FAILED');
  });

  it('returns status=error when raw.text is not a string (null)', () => {
    const result = svc.mapResponse({
      latencyMs: 100,
      raw: { text: null, durationMs: null },
    });

    expect(result.status).toBe('error');
    expect(result.transcript).toBeNull();
  });

  it('returns status=error with the supplied errorCategory when errorCategory is set', () => {
    const result = svc.mapResponse({
      latencyMs: 200,
      raw: null,
      errorCategory: 'STT_TIMEOUT',
    });

    expect(result.status).toBe('error');
    expect(result.errorCategory).toBe('STT_TIMEOUT');
  });

  it('prefers errorCategory over a missing raw response', () => {
    const result = svc.mapResponse({
      latencyMs: 0,
      raw: null,
      errorCategory: 'STT_RATE_LIMITED',
    });

    expect(result.errorCategory).toBe('STT_RATE_LIMITED');
  });

  // -------------------------------------------------------------------------
  // Authority boundary: no AIM/mastery fields in output
  // -------------------------------------------------------------------------

  it('success response does not include mastery, difficulty, or AIM fields', () => {
    const result = svc.mapResponse({ latencyMs: 100, raw: { text: 'hi', durationMs: 100 } });

    expect((result as any).mastery).toBeUndefined();
    expect((result as any).difficulty).toBeUndefined();
    expect((result as any).weakness).toBeUndefined();
    expect((result as any).recommendation).toBeUndefined();
  });

  it('error response does not include mastery, difficulty, or AIM fields', () => {
    const result = svc.mapResponse({ latencyMs: 0, raw: null });

    expect((result as any).mastery).toBeUndefined();
    expect((result as any).difficulty).toBeUndefined();
  });
});
