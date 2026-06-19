// P8-060: Add No Secret Check for AI Provider Config
// ProviderGatewayNoSecretCheckService tests.

import { ProviderGatewayNoSecretCheckService } from '../provider-gateway-no-secret-check.service';
import { ProviderGatewayConfigService } from '../provider-gateway.config';

function makeMockConfig(config: { apiKey: string; model: string }) {
  return { getConfig: () => config } as unknown as ProviderGatewayConfigService;
}

describe('ProviderGatewayNoSecretCheckService', () => {
  it('does not throw for a real, non-placeholder config', () => {
    const service = new ProviderGatewayNoSecretCheckService(
      makeMockConfig({ apiKey: 'a1b2c3d4e5f6g7h8i9j0', model: 'gpt-4o-mini' }),
    );

    expect(() => service.assertConfigIsSafe()).not.toThrow();
  });

  it('throws when apiKey is missing', () => {
    const service = new ProviderGatewayNoSecretCheckService(
      makeMockConfig({ apiKey: '', model: 'gpt-4o-mini' }),
    );

    expect(() => service.assertConfigIsSafe()).toThrow(/AI_PROVIDER_API_KEY is missing/);
  });

  it('throws when apiKey is whitespace-only', () => {
    const service = new ProviderGatewayNoSecretCheckService(
      makeMockConfig({ apiKey: '   ', model: 'gpt-4o-mini' }),
    );

    expect(() => service.assertConfigIsSafe()).toThrow(/AI_PROVIDER_API_KEY is missing/);
  });

  it.each([
    'changeme',
    'change_me',
    'your-api-key',
    'your_api_key',
    'replace-me',
    'replace_me',
    'example',
    'placeholder',
    'todo',
    'xxxx',
    'YOUR_API_KEY_HERE',
    'sk-example-1234',
  ])('throws when apiKey looks like a placeholder: %s', (placeholder) => {
    const service = new ProviderGatewayNoSecretCheckService(
      makeMockConfig({ apiKey: placeholder, model: 'gpt-4o-mini' }),
    );

    expect(() => service.assertConfigIsSafe()).toThrow(/looks like a placeholder/);
  });

  it('throws when model is missing', () => {
    const service = new ProviderGatewayNoSecretCheckService(
      makeMockConfig({ apiKey: 'a1b2c3d4e5f6g7h8i9j0', model: '' }),
    );

    expect(() => service.assertConfigIsSafe()).toThrow(/AI_PROVIDER_MODEL is missing/);
  });

  it('never includes the actual apiKey value in a thrown error message', () => {
    const secret = 'super-secret-real-key-zzz999';
    const service = new ProviderGatewayNoSecretCheckService(
      makeMockConfig({ apiKey: secret, model: '' }),
    );

    try {
      service.assertConfigIsSafe();
      throw new Error('expected assertConfigIsSafe to throw');
    } catch (error) {
      expect((error as Error).message).not.toContain(secret);
    }
  });

  it('never hard-codes a provider API key or reads process.env directly', () => {
    const source = require('fs').readFileSync(
      require.resolve('../provider-gateway-no-secret-check.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', () => {
    const source = require('fs').readFileSync(
      require.resolve('../provider-gateway-no-secret-check.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/mastery/i);
    expect(codeOnly).not.toMatch(/\blevel\b/i);
    expect(codeOnly).not.toMatch(/weakness/i);
    expect(codeOnly).not.toMatch(/difficulty/i);
    expect(codeOnly).not.toMatch(/recommendation/i);
    expect(codeOnly).not.toMatch(/reviewSchedule/i);
  });
});
