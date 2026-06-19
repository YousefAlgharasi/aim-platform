/**
 * P9-059: Add TTS Provider Config (Group G — Text-to-Speech Pipeline).
 * Backend-only, safe-config accessor for Group G's TTS Gateway. Wraps
 * `BackendConfigService.ttsProvider` (validated from environment
 * variables `TTS_PROVIDER_API_KEY` / `TTS_PROVIDER_MODEL` via
 * `backend-config.validation.ts`; no value is hard-coded or committed),
 * mirroring `stt-gateway/stt-gateway.config.ts`.
 *
 * Callers in `tts-gateway/` must read provider configuration only through
 * this service, never via `process.env` directly, so there is a single,
 * auditable seam for TTS provider credentials
 * (docs/phase-9/no-client-provider-rule.md). `apiKey` exists only to be
 * passed to the TTS provider HTTP client by a later Group G task; it is
 * never logged, never included in `TtsProviderResponse`
 * (tts-gateway.types.ts), and never returned to Flutter.
 */
import { Injectable } from '@nestjs/common';

import { BackendConfigService } from '../../../config/backend-config.service';

export interface TtsGatewayConfig {
  readonly apiKey: string;
  readonly model: string;
}

@Injectable()
export class TtsGatewayConfigService {
  constructor(private readonly backendConfig: BackendConfigService) {}

  getConfig(): TtsGatewayConfig {
    const { apiKey, model } = this.backendConfig.ttsProvider;
    return { apiKey, model };
  }
}
