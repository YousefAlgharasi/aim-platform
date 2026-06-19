// P9-046: Add STT Provider Tests — SttSafeFailureService.
// Verifies that the safe failure handler (P9-045) converts any non-success
// SttProviderResponse into the fixed student-facing fallback message,
// never leaking internal error categories, provider text, or AIM fields.

import { SttSafeFailureService } from '../stt-safe-failure.service';
import { STT_SAFE_FALLBACK_MESSAGE } from '../stt-safe-failure.constants';
import { SttProviderResponse } from '../stt-gateway.types';

describe('SttSafeFailureService', () => {
  let svc: SttSafeFailureService;

  beforeEach(() => {
    svc = new SttSafeFailureService();
  });

  // -------------------------------------------------------------------------
  // Success path
  // -------------------------------------------------------------------------

  it('returns isFallback=false and the transcript on success', () => {
    const response: SttProviderResponse = {
      status: 'success',
      transcript: 'مرحباً بالعالم',
      durationMs: 1000,
    };

    const outcome = svc.toSafeOutcome(response);

    expect(outcome.isFallback).toBe(false);
    expect(outcome.transcript).toBe('مرحباً بالعالم');
    expect(outcome.message).toBeNull();
  });

  it('passes through an empty transcript on success without treating it as a failure', () => {
    const response: SttProviderResponse = { status: 'success', transcript: '', durationMs: 300 };
    const outcome = svc.toSafeOutcome(response);

    expect(outcome.isFallback).toBe(false);
    expect(outcome.transcript).toBe('');
  });

  // -------------------------------------------------------------------------
  // Failure paths
  // -------------------------------------------------------------------------

  it('returns isFallback=true and the fixed fallback message on error status', () => {
    const response: SttProviderResponse = {
      status: 'error',
      transcript: null,
      durationMs: null,
      errorCategory: 'STT_PROVIDER_CALL_FAILED',
    };

    const outcome = svc.toSafeOutcome(response);

    expect(outcome.isFallback).toBe(true);
    expect(outcome.transcript).toBeNull();
    expect(outcome.message).toBe(STT_SAFE_FALLBACK_MESSAGE);
  });

  it('returns isFallback=true on timeout status', () => {
    const response: SttProviderResponse = { status: 'timeout', transcript: null, durationMs: null };
    const outcome = svc.toSafeOutcome(response);

    expect(outcome.isFallback).toBe(true);
    expect(outcome.message).toBe(STT_SAFE_FALLBACK_MESSAGE);
  });

  it('returns isFallback=true on low-confidence downgrade (STT_LOW_CONFIDENCE error)', () => {
    const response: SttProviderResponse = {
      status: 'error',
      transcript: null,
      durationMs: null,
      errorCategory: 'STT_LOW_CONFIDENCE',
    };

    const outcome = svc.toSafeOutcome(response);

    expect(outcome.isFallback).toBe(true);
    expect(outcome.message).toBe(STT_SAFE_FALLBACK_MESSAGE);
  });

  // -------------------------------------------------------------------------
  // Safety: internal error details must not be exposed
  // -------------------------------------------------------------------------

  it('does NOT expose the internal errorCategory to the client via the outcome', () => {
    const response: SttProviderResponse = {
      status: 'error',
      transcript: null,
      durationMs: null,
      errorCategory: 'STT_RATE_LIMITED',
    };

    const outcome = svc.toSafeOutcome(response);

    // The outcome shape only has transcript, message, isFallback
    expect((outcome as any).errorCategory).toBeUndefined();
    expect(outcome.message).toBe(STT_SAFE_FALLBACK_MESSAGE);
  });

  it('fallback message does not include mastery, difficulty, or AIM fields', () => {
    const response: SttProviderResponse = { status: 'error', transcript: null, durationMs: null };
    const outcome = svc.toSafeOutcome(response);

    expect((outcome as any).mastery).toBeUndefined();
    expect((outcome as any).difficulty).toBeUndefined();
    expect((outcome as any).weakness).toBeUndefined();
  });

  it('STT_SAFE_FALLBACK_MESSAGE is a non-empty student-safe string', () => {
    expect(typeof STT_SAFE_FALLBACK_MESSAGE).toBe('string');
    expect(STT_SAFE_FALLBACK_MESSAGE.length).toBeGreaterThan(0);
    // Must not expose internal error codes or provider names
    expect(STT_SAFE_FALLBACK_MESSAGE.toLowerCase()).not.toContain('api');
    expect(STT_SAFE_FALLBACK_MESSAGE.toLowerCase()).not.toContain('provider');
    expect(STT_SAFE_FALLBACK_MESSAGE.toLowerCase()).not.toContain('error');
  });
});
