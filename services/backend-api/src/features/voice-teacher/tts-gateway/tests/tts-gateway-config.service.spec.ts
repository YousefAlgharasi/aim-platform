import { TtsGatewayConfigService } from '../tts-gateway.config';

describe('TtsGatewayConfigService', () => {
  it('should return apiKey, model, baseUrl, voice, and resultsUrl from backend config', () => {
    const mockBackendConfig = {
      ttsProvider: {
        apiKey: 'test-key-123',
        model: 'kokoro',
        baseUrl: 'https://api.tts.ai/v1/tts/',
        voice: 'af_bella',
        resultsUrl: 'https://api.tts.ai/v1/speech/results/',
      },
    } as any;

    const service = new TtsGatewayConfigService(mockBackendConfig);
    const config = service.getConfig();

    expect(config.apiKey).toBe('test-key-123');
    expect(config.model).toBe('kokoro');
    expect(config.baseUrl).toBe('https://api.tts.ai/v1/tts/');
    expect(config.voice).toBe('af_bella');
    expect(config.resultsUrl).toBe('https://api.tts.ai/v1/speech/results/');
  });

  it('should never include extra fields beyond apiKey, model, baseUrl, voice, and resultsUrl', () => {
    const mockBackendConfig = {
      ttsProvider: {
        apiKey: 'k',
        model: 'm',
        baseUrl: 'https://api.tts.ai/v1/tts/',
        voice: 'af_bella',
        resultsUrl: 'https://api.tts.ai/v1/speech/results/',
        extra: 'x',
      },
    } as any;

    const service = new TtsGatewayConfigService(mockBackendConfig);
    const config = service.getConfig();

    expect(Object.keys(config)).toEqual(['apiKey', 'model', 'baseUrl', 'voice', 'resultsUrl']);
  });
});
