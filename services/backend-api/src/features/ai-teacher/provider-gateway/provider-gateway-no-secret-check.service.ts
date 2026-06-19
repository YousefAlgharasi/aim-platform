/**
 * P8-060: Add No Secret Check for AI Provider Config (Group F — AI
 * Provider Gateway). A startup-time guard, run before any AI provider
 * call is allowed, that fails fast if `ProviderGatewayConfigService`
 * (P8-054) resolves to a missing value or an obvious placeholder left
 * over from an example `.env` file — never a real, committed secret.
 * This service never logs, returns, or includes the API key value
 * itself in any error message; only the fact that it is missing or
 * placeholder-shaped is ever surfaced
 * (docs/phase-8/no-client-ai-provider-rule.md,
 * docs/phase-8/privacy-policy.md). It computes no mastery/level/
 * weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
import { Injectable } from '@nestjs/common';

import { ProviderGatewayConfigService } from './provider-gateway.config';

const PLACEHOLDER_API_KEY_FRAGMENTS = [
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
];

@Injectable()
export class ProviderGatewayNoSecretCheckService {
  constructor(private readonly providerGatewayConfig: ProviderGatewayConfigService) {}

  assertConfigIsSafe(): void {
    const { apiKey, model } = this.providerGatewayConfig.getConfig();

    if (!this.isNonEmpty(apiKey)) {
      throw new Error(
        'AI provider configuration is invalid: AI_PROVIDER_API_KEY is missing.',
      );
    }

    if (this.looksLikePlaceholder(apiKey)) {
      throw new Error(
        'AI provider configuration is invalid: AI_PROVIDER_API_KEY looks like a placeholder value, not a real secret.',
      );
    }

    if (!this.isNonEmpty(model)) {
      throw new Error('AI provider configuration is invalid: AI_PROVIDER_MODEL is missing.');
    }
  }

  private isNonEmpty(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private looksLikePlaceholder(apiKey: string): boolean {
    const normalized = apiKey.trim().toLowerCase();
    return PLACEHOLDER_API_KEY_FRAGMENTS.some((fragment) => normalized.includes(fragment));
  }
}
