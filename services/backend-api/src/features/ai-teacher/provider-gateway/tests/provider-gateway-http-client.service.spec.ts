// P8-065: Build AI Response Generation Flow
// ProviderGatewayHttpClientService tests.

import { ProviderGatewayHttpClientService } from '../provider-gateway-http-client.service';
import { ProviderGatewayConfigService } from '../provider-gateway.config';
import { ProviderRequestMapperService } from '../provider-request.mapper';
import { ProviderResponseMapperService } from '../provider-response.mapper';
import { AiProviderRequest } from '../provider-gateway.types';

function makeRequest(): AiProviderRequest {
  return {
    sessionId: 'session-1',
    prompt: {
      systemInstructions: 'You are a patient AI Teacher.',
      sections: [{ key: 'context', content: 'lesson:fractions' }],
      studentMessage: 'How do I add fractions?',
    },
  };
}

const TEST_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

function makeConfig() {
  return {
    getConfig: jest.fn().mockReturnValue({
      apiKey: 'sk-real-key-not-a-placeholder',
      model: 'gpt-test',
      baseUrl: TEST_BASE_URL,
    }),
  } as unknown as ProviderGatewayConfigService;
}

describe('ProviderGatewayHttpClientService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('maps the request, calls the provider endpoint, and maps a successful response', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'Add the numerators.' } }] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const config = makeConfig();
    const service = new ProviderGatewayHttpClientService(
      config,
      new ProviderRequestMapperService(config),
      new ProviderResponseMapperService(),
    );

    const result = await service.complete(makeRequest());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(TEST_BASE_URL);
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer sk-real-key-not-a-placeholder');
    expect(result.status).toBe('success');
    expect(result.text).toBe('Add the numerators.');
  });

  it('never sends the API key inside the request body', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'Reply.' } }] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const config = makeConfig();
    const service = new ProviderGatewayHttpClientService(
      config,
      new ProviderRequestMapperService(config),
      new ProviderResponseMapperService(),
    );

    await service.complete(makeRequest());

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).not.toMatch(/sk-real-key-not-a-placeholder/);
  });

  it('maps a non-ok HTTP response to an error status, never inventing reply text', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: false, json: jest.fn() });
    global.fetch = fetchMock as unknown as typeof fetch;

    const config = makeConfig();
    const service = new ProviderGatewayHttpClientService(
      config,
      new ProviderRequestMapperService(config),
      new ProviderResponseMapperService(),
    );

    const result = await service.complete(makeRequest());

    expect(result.status).toBe('error');
    expect(result.text).toBeNull();
  });

  it('maps a thrown network error to an error status, never inventing reply text', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('network down'));
    global.fetch = fetchMock as unknown as typeof fetch;

    const config = makeConfig();
    const service = new ProviderGatewayHttpClientService(
      config,
      new ProviderRequestMapperService(config),
      new ProviderResponseMapperService(),
    );

    const result = await service.complete(makeRequest());

    expect(result.status).toBe('error');
    expect(result.text).toBeNull();
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'Reply.' } }] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const config = makeConfig();
    const service = new ProviderGatewayHttpClientService(
      config,
      new ProviderRequestMapperService(config),
      new ProviderResponseMapperService(),
    );

    const result = await service.complete(makeRequest());
    const serialized = JSON.stringify(result);

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/\blevel\b/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });

  it('never hard-codes a provider API key or reads process.env directly', () => {
    const source = require('fs').readFileSync(
      require.resolve('../provider-gateway-http-client.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]{10,}/);
  });
});
