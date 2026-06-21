import { TtsGatewayConfigService } from '../tts-gateway.config';

describe('TtsGatewayConfigService', () => {
  it('should return apiKey and model from backend config', () => {
    const mockBackendConfig = {
      ttsProvider: { apiKey: 'test-key-123', model: 'tts-1' },
    } as any;

    const service = new TtsGatewayConfigService(mockBackendConfig);
    const config = service.getConfig();

    expect(config.apiKey).toBe('test-key-123');
    expect(config.model).toBe('tts-1');
  });

  it('should never include extra fields beyond apiKey and model', () => {
    const mockBackendConfig = {
      ttsProvider: { apiKey: 'k', model: 'm', extra: 'x' },
    } as any;

    const service = new TtsGatewayConfigService(mockBackendConfig);
    const config = service.getConfig();

    expect(Object.keys(config)).toEqual(['apiKey', 'model']);
  });
});
