// P9-046: Add STT Provider Tests — SttConfidencePolicyService.
// Verifies that the confidence policy (P9-043) correctly downgrades
// low-confidence transcripts to errors and passes through high-confidence
// or already-errored responses, without making any AIM decisions.

import { SttConfidencePolicyService } from '../stt-confidence-policy.service';
import {
  STT_LOW_CONFIDENCE_THRESHOLD,
  STT_LOW_CONFIDENCE_ERROR_CATEGORY,
} from '../stt-confidence-policy.constants';
import { SttProviderResponse } from '../stt-gateway.types';

const SUCCESS: SttProviderResponse = {
  status: 'success',
  transcript: 'كيف حالك؟',
  durationMs: 1500,
};

const ERROR_RESP: SttProviderResponse = {
  status: 'error',
  transcript: null,
  durationMs: null,
  errorCategory: 'STT_PROVIDER_CALL_FAILED',
};

describe('SttConfidencePolicyService', () => {
  let svc: SttConfidencePolicyService;

  beforeEach(() => {
    svc = new SttConfidencePolicyService();
  });

  it('passes through a success response when confidence is above threshold', () => {
    const result = svc.apply(SUCCESS, STT_LOW_CONFIDENCE_THRESHOLD + 0.01);
    expect(result.status).toBe('success');
    expect(result.transcript).toBe('كيف حالك؟');
  });

  it('passes through a success response when confidence is exactly at threshold', () => {
    const result = svc.apply(SUCCESS, STT_LOW_CONFIDENCE_THRESHOLD);
    expect(result.status).toBe('success');
  });

  it('downgrades a success response to error when confidence is below threshold', () => {
    const result = svc.apply(SUCCESS, STT_LOW_CONFIDENCE_THRESHOLD - 0.01);
    expect(result.status).toBe('error');
    expect(result.transcript).toBeNull();
    expect(result.errorCategory).toBe(STT_LOW_CONFIDENCE_ERROR_CATEGORY);
  });

  it('downgrades when confidence is 0', () => {
    const result = svc.apply(SUCCESS, 0);
    expect(result.status).toBe('error');
    expect(result.errorCategory).toBe(STT_LOW_CONFIDENCE_ERROR_CATEGORY);
  });

  it('passes through a success response when confidence is null (provider did not return one)', () => {
    const result = svc.apply(SUCCESS, null);
    expect(result.status).toBe('success');
    expect(result.transcript).toBe('كيف حالك؟');
  });

  it('does not alter an already-errored response regardless of confidence', () => {
    const result = svc.apply(ERROR_RESP, 0.1);
    expect(result.status).toBe('error');
    expect(result.errorCategory).toBe('STT_PROVIDER_CALL_FAILED');
  });

  it('does not alter a timeout response', () => {
    const timeout: SttProviderResponse = { status: 'timeout', transcript: null, durationMs: null };
    const result = svc.apply(timeout, 0);
    expect(result.status).toBe('timeout');
  });

  it('low-confidence downgrade does not introduce mastery or AIM fields', () => {
    const result = svc.apply(SUCCESS, 0.1);
    expect((result as any).mastery).toBeUndefined();
    expect((result as any).difficulty).toBeUndefined();
    expect((result as any).weakness).toBeUndefined();
  });

  it('STT_LOW_CONFIDENCE_THRESHOLD constant is a number between 0 and 1', () => {
    expect(typeof STT_LOW_CONFIDENCE_THRESHOLD).toBe('number');
    expect(STT_LOW_CONFIDENCE_THRESHOLD).toBeGreaterThan(0);
    expect(STT_LOW_CONFIDENCE_THRESHOLD).toBeLessThan(1);
  });
});
