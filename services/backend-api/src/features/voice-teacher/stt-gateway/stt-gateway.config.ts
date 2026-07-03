/**
 * P9-039: Add STT Provider Config (Group E — Speech-to-Text Pipeline).
 * Backend-only, safe-config accessor for Group E's STT Gateway. Wraps
 * `BackendConfigService.sttProvider` (validated from environment
 * variables `STT_PROVIDER_API_KEY` / `STT_PROVIDER_MODEL` via
 * `backend-config.validation.ts`; no value is hard-coded or committed),
 * mirroring `ai-teacher/provider-gateway/provider-gateway.config.ts`.
 *
 * Callers in `stt-gateway/` must read provider configuration only through
 * this service, never via `process.env` directly, so there is a single,
 * auditable seam for STT provider credentials
 * (docs/phase-9/no-client-provider-rule.md). `apiKey` exists only to be
 * passed to the STT provider HTTP client by a later Group E task; it is
 * never logged, never included in `SttProviderResponse`
 * (stt-gateway.types.ts), and never returned to Flutter.
 */
import { Injectable } from '@nestjs/common';

import { BackendConfigService } from '../../../config/backend-config.service';

export interface SttGatewayConfig {
  readonly apiKey: string;
  readonly model: string;
  readonly baseUrl: string;
}

@Injectable()
export class SttGatewayConfigService {
  constructor(private readonly backendConfig: BackendConfigService) {}

  getConfig(): SttGatewayConfig {
    const { apiKey, model, baseUrl } = this.backendConfig.sttProvider;
    return { apiKey, model, baseUrl };
  }
}
