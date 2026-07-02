/**
 * P8-054: Add AI Provider Configuration (Group F — AI Provider Gateway).
 * Backend-only, safe-config accessor for Group F's AI Provider Gateway.
 * Wraps `BackendConfigService.aiProvider` (validated from environment
 * variables `AI_PROVIDER_API_KEY` / `AI_PROVIDER_MODEL` via
 * `backend-config.validation.ts`; no value is hard-coded or committed).
 *
 * Callers in `provider-gateway/` must read provider configuration only
 * through this service, never via `process.env` directly, so there is a
 * single, auditable seam for provider credentials
 * (docs/phase-8/no-client-ai-provider-rule.md). `apiKey` exists only to
 * be passed to the provider HTTP client by a later Group F task; it is
 * never logged, never included in `AiProviderResponse`
 * (provider-gateway.types.ts), and never returned to Flutter.
 */
import { Injectable } from '@nestjs/common';

import { BackendConfigService } from '../../../config/backend-config.service';

export interface ProviderGatewayConfig {
  readonly apiKey: string;
  readonly model: string;
  readonly baseUrl: string;
}

@Injectable()
export class ProviderGatewayConfigService {
  constructor(private readonly backendConfig: BackendConfigService) {}

  getConfig(): ProviderGatewayConfig {
    const { apiKey, model, baseUrl } = this.backendConfig.aiProvider;
    return { apiKey, model, baseUrl };
  }
}
