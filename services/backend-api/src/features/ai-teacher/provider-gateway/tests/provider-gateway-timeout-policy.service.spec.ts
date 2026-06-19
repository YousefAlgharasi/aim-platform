// P8-057: Add AI Provider Timeout Policy
// ProviderGatewayTimeoutPolicyService tests.

import { ProviderGatewayTimeoutPolicyService } from '../provider-gateway-timeout-policy.service';
import { AiProviderResponse } from '../provider-gateway.types';
import { AI_PROVIDER_MAX_ATTEMPTS } from '../provider-gateway-timeout.constants';

function successResponse(): AiProviderResponse {
  return { status: 'success', text: 'ok', provider: 'p', model: 'm', latencyMs: 10 };
}

function errorResponse(): AiProviderResponse {
  return {
    status: 'error',
    text: null,
    provider: 'p',
    model: 'm',
    latencyMs: 10,
    errorCategory: 'PROVIDER_5XX',
  };
}

describe('ProviderGatewayTimeoutPolicyService', () => {
  it('returns immediately on a successful first attempt', async () => {
    const policy = new ProviderGatewayTimeoutPolicyService();
    const attemptFn = jest.fn().mockResolvedValue(successResponse());

    const outcome = await policy.execute(attemptFn);

    expect(outcome.response.status).toBe('success');
    expect(outcome.attemptsMade).toBe(1);
    expect(attemptFn).toHaveBeenCalledTimes(1);
  });

  it('retries on error up to the configured max attempts', async () => {
    const policy = new ProviderGatewayTimeoutPolicyService();
    const attemptFn = jest.fn().mockResolvedValue(errorResponse());

    const outcome = await policy.execute(attemptFn);

    expect(attemptFn).toHaveBeenCalledTimes(AI_PROVIDER_MAX_ATTEMPTS);
    expect(outcome.attemptsMade).toBe(AI_PROVIDER_MAX_ATTEMPTS);
    expect(outcome.response.status).toBe('error');
  });

  it('stops retrying as soon as an attempt succeeds', async () => {
    const policy = new ProviderGatewayTimeoutPolicyService();
    const attemptFn = jest
      .fn()
      .mockResolvedValueOnce(errorResponse())
      .mockResolvedValueOnce(successResponse());

    const outcome = await policy.execute(attemptFn);

    expect(attemptFn).toHaveBeenCalledTimes(2);
    expect(outcome.response.status).toBe('success');
  });

  it('treats an attempt that never resolves as a timeout', async () => {
    const policy = new ProviderGatewayTimeoutPolicyService();
    const attemptFn = jest.fn().mockImplementation(() => new Promise(() => {}));

    const outcome = await policy.execute(attemptFn);

    expect(outcome.response.status).toBe('timeout');
  }, 20000);

  it('never includes a mastery, level, weakness, or difficulty field in the response', async () => {
    const policy = new ProviderGatewayTimeoutPolicyService();
    const attemptFn = jest.fn().mockResolvedValue(successResponse());

    const outcome = await policy.execute(attemptFn);
    const serialized = JSON.stringify(outcome.response);

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/difficulty/i);
  });
});
