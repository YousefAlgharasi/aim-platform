// P8-059: Add AI Provider Logging
// ProviderGatewayLoggingService tests.

import { ProviderGatewayLoggingService } from '../provider-gateway-logging.service';
import { AiProviderLogRepository } from '../../repositories/ai-provider-log.repository';
import { AiProviderResponse } from '../provider-gateway.types';

function makeMockRepository(create: AiProviderLogRepository['create']) {
  return { create } as unknown as AiProviderLogRepository;
}

describe('ProviderGatewayLoggingService', () => {
  it('persists provider, model, status, errorCategory, and latency only', async () => {
    const calls: unknown[] = [];
    const repository = makeMockRepository(async (input) => {
      calls.push(input);
      return {
        id: 'log-1',
        session_id: input.sessionId,
        provider: input.provider,
        model: input.model,
        status: input.status,
        error_category: input.errorCategory ?? null,
        latency_ms: input.latencyMs ?? null,
        created_at: '2026-06-19T00:00:00Z',
      };
    });
    const service = new ProviderGatewayLoggingService(repository);

    const response: AiProviderResponse = {
      status: 'success',
      text: 'this is the full provider response text',
      provider: 'fake-provider',
      model: 'fake-model',
      latencyMs: 123,
    };

    await service.logAttempt('session-1', response);

    expect(calls).toEqual([
      {
        sessionId: 'session-1',
        provider: 'fake-provider',
        model: 'fake-model',
        status: 'success',
        errorCategory: null,
        latencyMs: 123,
      },
    ]);
  });

  it('never persists the response text field', async () => {
    const calls: unknown[] = [];
    const repository = makeMockRepository(async (input) => {
      calls.push(input);
      return {
        id: 'log-1',
        session_id: input.sessionId,
        provider: input.provider,
        model: input.model,
        status: input.status,
        error_category: input.errorCategory ?? null,
        latency_ms: input.latencyMs ?? null,
        created_at: '2026-06-19T00:00:00Z',
      };
    });
    const service = new ProviderGatewayLoggingService(repository);

    await service.logAttempt('session-1', {
      status: 'error',
      text: 'sensitive provider output',
      provider: 'fake-provider',
      model: 'fake-model',
      latencyMs: 50,
      errorCategory: 'PROVIDER_5XX',
    });

    expect(JSON.stringify(calls)).not.toContain('sensitive provider output');
  });

  it('does not throw when the repository write fails', async () => {
    const repository = makeMockRepository(async () => {
      throw new Error('db unavailable');
    });
    const service = new ProviderGatewayLoggingService(repository);

    await expect(
      service.logAttempt('session-1', {
        status: 'timeout',
        text: null,
        provider: 'fake-provider',
        model: 'fake-model',
        latencyMs: 8000,
      }),
    ).resolves.toBeUndefined();
  });
});
