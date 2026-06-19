// P8-058: Add AI Provider Safe Failure Handling
// ProviderGatewaySafeFailureService tests.

import { ProviderGatewaySafeFailureService } from '../provider-gateway-safe-failure.service';
import { AI_PROVIDER_SAFE_FALLBACK_MESSAGE } from '../provider-gateway-safe-failure.constants';
import { AiProviderResponse } from '../provider-gateway.types';

function makeResponse(overrides: Partial<AiProviderResponse>): AiProviderResponse {
  return {
    status: 'success',
    text: 'a normal reply',
    provider: 'p',
    model: 'm',
    latencyMs: 10,
    ...overrides,
  };
}

describe('ProviderGatewaySafeFailureService', () => {
  it('passes through the provider text unchanged on success', () => {
    const service = new ProviderGatewaySafeFailureService();
    const reply = service.toSafeReply(makeResponse({ status: 'success', text: 'Great job!' }));

    expect(reply).toEqual({ text: 'Great job!', isFallback: false });
  });

  it('returns the fixed fallback message on error status', () => {
    const service = new ProviderGatewaySafeFailureService();
    const reply = service.toSafeReply(
      makeResponse({ status: 'error', text: null, errorCategory: 'PROVIDER_5XX' }),
    );

    expect(reply).toEqual({ text: AI_PROVIDER_SAFE_FALLBACK_MESSAGE, isFallback: true });
  });

  it('returns the fixed fallback message on timeout status', () => {
    const service = new ProviderGatewaySafeFailureService();
    const reply = service.toSafeReply(makeResponse({ status: 'timeout', text: null }));

    expect(reply).toEqual({ text: AI_PROVIDER_SAFE_FALLBACK_MESSAGE, isFallback: true });
  });

  it('treats a success status with empty/missing text as a failure, not empty content', () => {
    const service = new ProviderGatewaySafeFailureService();
    const reply = service.toSafeReply(makeResponse({ status: 'success', text: '   ' }));

    expect(reply).toEqual({ text: AI_PROVIDER_SAFE_FALLBACK_MESSAGE, isFallback: true });
  });

  it('never includes provider error text, status codes, or internal detail in the reply', () => {
    const service = new ProviderGatewaySafeFailureService();
    const reply = service.toSafeReply(
      makeResponse({
        status: 'error',
        text: null,
        errorCategory: 'UPSTREAM_500_INTERNAL_TRACE_abc123',
      }),
    );

    expect(reply.text).not.toContain('UPSTREAM_500_INTERNAL_TRACE_abc123');
    expect(reply.text).toBe(AI_PROVIDER_SAFE_FALLBACK_MESSAGE);
  });

  it('never references mastery, level, weakness, or difficulty on failure', () => {
    const service = new ProviderGatewaySafeFailureService();
    const reply = service.toSafeReply(makeResponse({ status: 'error', text: null }));
    const serialized = JSON.stringify(reply);

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/difficulty/i);
  });
});
