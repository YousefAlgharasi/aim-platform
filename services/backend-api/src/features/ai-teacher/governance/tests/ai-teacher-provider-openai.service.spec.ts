// AiTeacherProviderOpenAiService tests.
//
// Covers:
//   1. generateText posts to the configured baseUrl (not a hard-coded
//      OpenAI URL), so any OpenAI-compatible provider (e.g. Groq) works.
//   2. moderateContent classifies via a chat-completions prompt against
//      the same configured baseUrl/model — no dependency on OpenAI's
//      provider-specific /v1/moderations endpoint.
//   3. moderateContent treats any non-"SAFE" or unparseable reply as
//      flagged (fail closed on ambiguous output).

import { AiTeacherProviderOpenAiService } from '../ai-teacher-provider-openai.service';
import { ProviderGatewayConfigService } from '../../provider-gateway/provider-gateway.config';

const TEST_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

function makeConfig() {
  return {
    getConfig: jest.fn().mockReturnValue({
      apiKey: 'gsk-test-key',
      model: 'llama-3.3-70b-versatile',
      baseUrl: TEST_BASE_URL,
    }),
  } as unknown as ProviderGatewayConfigService;
}

describe('AiTeacherProviderOpenAiService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('generateText', () => {
    it('posts to the configured baseUrl, not a hard-coded OpenAI URL', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Hello!' } }],
          usage: { total_tokens: 12 },
        }),
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      const service = new AiTeacherProviderOpenAiService(makeConfig());
      const result = await service.generateText({
        providerKeyRef: 'ref',
        modelId: 'x',
        prompt: 'Hi',
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(TEST_BASE_URL);
      expect(result.text).toBe('Hello!');
      expect(result.tokensUsed).toBe(12);
    });
  });

  describe('moderateContent', () => {
    it('posts a classification prompt to the configured baseUrl', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'SAFE' } }] }),
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      const service = new AiTeacherProviderOpenAiService(makeConfig());
      await service.moderateContent({ providerKeyRef: 'ref', content: 'How do I add fractions?' });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(TEST_BASE_URL);
      const body = JSON.parse(init.body as string);
      expect(body.model).toBe('llama-3.3-70b-versatile');
      expect(body.messages[1].content).toBe('How do I add fractions?');
    });

    it('returns flagged: false for a SAFE verdict', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'SAFE' } }] }),
      }) as unknown as typeof fetch;

      const service = new AiTeacherProviderOpenAiService(makeConfig());
      const result = await service.moderateContent({ providerKeyRef: 'ref', content: 'hello' });

      expect(result).toEqual({ flagged: false, categories: [] });
    });

    it('returns flagged: true for an UNSAFE verdict', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'UNSAFE' } }] }),
      }) as unknown as typeof fetch;

      const service = new AiTeacherProviderOpenAiService(makeConfig());
      const result = await service.moderateContent({ providerKeyRef: 'ref', content: 'bad' });

      expect(result.flagged).toBe(true);
      expect(result.categories).toEqual(['unsafe_content']);
    });

    it('treats an ambiguous/unparseable reply as flagged (fail closed)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'uncertain' } }] }),
      }) as unknown as typeof fetch;

      const service = new AiTeacherProviderOpenAiService(makeConfig());
      const result = await service.moderateContent({ providerKeyRef: 'ref', content: 'x' });

      expect(result.flagged).toBe(true);
    });

    it('throws on a non-ok HTTP response, letting the caller fail closed', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 }) as unknown as typeof fetch;

      const service = new AiTeacherProviderOpenAiService(makeConfig());

      await expect(
        service.moderateContent({ providerKeyRef: 'ref', content: 'x' }),
      ).rejects.toThrow();
    });
  });
});
