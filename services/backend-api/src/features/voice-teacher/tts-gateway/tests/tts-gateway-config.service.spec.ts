import { TtsGatewayConfigService } from '../tts-gateway.config';

describe('TtsGatewayConfigService', () => {
  it('should return apiKey, model, and baseUrl from backend config', () => {
    const mockBackendConfig = {
      ttsProvider: { apiKey: 'test-key-123', model: 'tts-1', baseUrl: 'https://tts.ai/v1/audio/speech' },
    } as any;

    const service = new TtsGatewayConfigService(mockBackendConfig);
    const config = service.getConfig();

    expect(config.apiKey).toBe('test-key-123');
    expect(config.model).toBe('tts-1');
    expect(config.baseUrl).toBe('https://tts.ai/v1/audio/speech');
  });

  it('should never include extra fields beyond apiKey, model, and baseUrl', () => {
    const mockBackendConfig = {
      ttsProvider: { apiKey: 'k', model: 'm', baseUrl: 'https://tts.ai/v1/audio/speech', extra: 'x' },
    } as any;

    const service = new TtsGatewayConfigService(mockBackendConfig);
    const config = service.getConfig();

    expect(Object.keys(config)).toEqual(['apiKey', 'model', 'baseUrl']);
  });
});
