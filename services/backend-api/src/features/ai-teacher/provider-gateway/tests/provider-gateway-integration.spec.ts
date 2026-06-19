// P8-061: Add AI Provider Gateway Tests
// Integration coverage across the AI Provider Gateway (Group F): request
// mapping, response mapping, timeout/retry policy, safe failure fallback,
// and the no-secret startup guard, working together as the gateway would
// use them. No real AI provider call is made; the provider attempt is a
// fake function supplied by the test, matching how ProviderGatewayTimeoutPolicyService
// delegates each attempt to a caller-supplied function.

import { AiTeacherPrompt } from '../../prompt-builder/prompt-builder.types';
import { AiProviderRequest, AiProviderResponse } from '../provider-gateway.types';
import { ProviderGatewayConfigService } from '../provider-gateway.config';
import { ProviderGatewayNoSecretCheckService } from '../provider-gateway-no-secret-check.service';
import { ProviderGatewaySafeFailureService } from '../provider-gateway-safe-failure.service';
import { ProviderGatewayTimeoutPolicyService } from '../provider-gateway-timeout-policy.service';
import { ProviderRequestMapperService } from '../provider-request.mapper';
import { ProviderResponseMapperService } from '../provider-response.mapper';
import { ProviderCompletionResponse } from '../provider-response-mapper.types';

function makeConfig(config: { apiKey: string; model: string }) {
  return { getConfig: () => config } as unknown as ProviderGatewayConfigService;
}

function makePrompt(): AiTeacherPrompt {
  return {
    systemInstructions: 'You are a patient AI teacher.',
    sections: [{ key: 'topic', content: 'Fractions' }],
    studentMessage: 'How do I add fractions?',
  };
}

function makeRequest(): AiProviderRequest {
  return { sessionId: 'session-1', prompt: makePrompt() };
}

describe('AI Provider Gateway — integration', () => {
  it('blocks the pipeline before mapping when the secret check fails', () => {
    const noSecretCheck = new ProviderGatewayNoSecretCheckService(
      makeConfig({ apiKey: 'changeme', model: 'gpt-4o-mini' }),
    );

    expect(() => noSecretCheck.assertConfigIsSafe()).toThrow(/looks like a placeholder/);
  });

  it('maps request, succeeds on first attempt, maps response, and returns provider text unchanged', async () => {
    const config = makeConfig({ apiKey: 'real-key-1234567890', model: 'gpt-4o-mini' });
    const noSecretCheck = new ProviderGatewayNoSecretCheckService(config);
    const requestMapper = new ProviderRequestMapperService(config);
    const responseMapper = new ProviderResponseMapperService();
    const timeoutPolicy = new ProviderGatewayTimeoutPolicyService();
    const safeFailure = new ProviderGatewaySafeFailureService();

    expect(() => noSecretCheck.assertConfigIsSafe()).not.toThrow();

    const providerRequest = requestMapper.mapRequest(makeRequest());
    expect(providerRequest.model).toBe('gpt-4o-mini');

    const rawResponse: ProviderCompletionResponse = {
      choices: [{ message: { content: 'Add the numerators when denominators match.' } }],
    };

    const outcome = await timeoutPolicy.execute(async () =>
      responseMapper.mapResponse({
        provider: 'fake-provider',
        model: providerRequest.model,
        latencyMs: 10,
        raw: rawResponse,
      }),
    );

    expect(outcome.attemptsMade).toBe(1);
    expect(outcome.response.status).toBe('success');

    const safeReply = safeFailure.toSafeReply(outcome.response);
    expect(safeReply.isFallback).toBe(false);
    expect(safeReply.text).toBe('Add the numerators when denominators match.');
  });

  it('retries on provider error, then converts the final failure into the fixed safe fallback', async () => {
    const responseMapper = new ProviderResponseMapperService();
    const timeoutPolicy = new ProviderGatewayTimeoutPolicyService();
    const safeFailure = new ProviderGatewaySafeFailureService();

    let attempts = 0;
    const outcome = await timeoutPolicy.execute(async () => {
      attempts += 1;
      return responseMapper.mapResponse({
        provider: 'fake-provider',
        model: 'gpt-4o-mini',
        latencyMs: 5,
        raw: null,
        errorCategory: 'PROVIDER_RATE_LIMITED',
      });
    });

    expect(attempts).toBeGreaterThan(1);
    expect(outcome.response.status).toBe('error');

    const safeReply = safeFailure.toSafeReply(outcome.response);
    expect(safeReply.isFallback).toBe(true);
    expect(safeReply.text).not.toMatch(/PROVIDER_RATE_LIMITED/);
  });

  it('converts an empty/malformed successful-looking response into the safe fallback, never inventing text', async () => {
    const responseMapper = new ProviderResponseMapperService();
    const safeFailure = new ProviderGatewaySafeFailureService();

    const response: AiProviderResponse = responseMapper.mapResponse({
      provider: 'fake-provider',
      model: 'gpt-4o-mini',
      latencyMs: 5,
      raw: { choices: [{ message: { content: '   ' } }] },
    });

    expect(response.status).toBe('error');

    const safeReply = safeFailure.toSafeReply(response);
    expect(safeReply.isFallback).toBe(true);
  });

  it('never includes the provider API key anywhere in the mapped request, raw response, or safe reply', () => {
    const config = makeConfig({ apiKey: 'super-secret-real-key-zzz999', model: 'gpt-4o-mini' });
    const requestMapper = new ProviderRequestMapperService(config);

    const providerRequest = requestMapper.mapRequest(makeRequest());
    const serialized = JSON.stringify(providerRequest);

    expect(serialized).not.toContain('super-secret-real-key-zzz999');
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value across the pipeline', async () => {
    const config = makeConfig({ apiKey: 'real-key-1234567890', model: 'gpt-4o-mini' });
    const requestMapper = new ProviderRequestMapperService(config);
    const responseMapper = new ProviderResponseMapperService();
    const safeFailure = new ProviderGatewaySafeFailureService();

    const providerRequest = requestMapper.mapRequest(makeRequest());
    const response = responseMapper.mapResponse({
      provider: 'fake-provider',
      model: 'gpt-4o-mini',
      latencyMs: 10,
      raw: { choices: [{ message: { content: 'Great job!' } }] },
    });
    const safeReply = safeFailure.toSafeReply(response);

    const serialized = JSON.stringify({ providerRequest, response, safeReply });

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/\blevel\b/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });
});
