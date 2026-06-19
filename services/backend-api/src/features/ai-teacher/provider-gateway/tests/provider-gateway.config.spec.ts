// P8-054: Add AI Provider Configuration
// ProviderGatewayConfigService tests.

import { ProviderGatewayConfigService } from '../provider-gateway.config';
import { BackendConfigService } from '../../../../config/backend-config.service';

function makeMockBackendConfig(aiProvider: { apiKey: string; model: string }) {
  return { aiProvider } as unknown as BackendConfigService;
}

describe('ProviderGatewayConfigService', () => {
  it('reads apiKey and model from BackendConfigService.aiProvider', () => {
    const backendConfig = makeMockBackendConfig({
      apiKey: 'test-ai-provider-key',
      model: 'test-model',
    });
    const service = new ProviderGatewayConfigService(backendConfig);

    const config = service.getConfig();

    expect(config).toEqual({ apiKey: 'test-ai-provider-key', model: 'test-model' });
  });

  it('never hard-codes a provider API key or reads process.env directly', () => {
    const source = require('fs').readFileSync(
      require.resolve('../provider-gateway.config'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });

  it('returns a fresh object per call rather than exposing internal config state', () => {
    const backendConfig = makeMockBackendConfig({ apiKey: 'key-1', model: 'model-1' });
    const service = new ProviderGatewayConfigService(backendConfig);

    const first = service.getConfig();
    const second = service.getConfig();

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });
});
