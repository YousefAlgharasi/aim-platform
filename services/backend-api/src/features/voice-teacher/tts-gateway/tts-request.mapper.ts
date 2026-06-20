/**
 * P9-060: Create TTS Request Mapper.
 * Converts an internal `TtsProviderRequest` (Group G contract,
 * tts-gateway.types.ts) carrying filtered reply text into a
 * provider-specific `TtsCompletionRequest`. This mapper performs no
 * database access, no TTS provider call, and computes no mastery/level/
 * weakness/difficulty/recommendation/review-schedule value; it only
 * restates the text in the provider's expected shape
 * (docs/phase-9/no-aim-authority-change-rule.md). The model name is read
 * from `TtsGatewayConfigService`, never hard-coded; the provider API key
 * is never read or included here, since the HTTP client (a later Group G
 * task) attaches it out-of-band, never inside the request body.
 */
import { Injectable } from '@nestjs/common';

import { TtsGatewayConfigService } from './tts-gateway.config';
import { TtsProviderRequest } from './tts-gateway.types';
import { TtsCompletionRequest } from './tts-request-mapper.types';

@Injectable()
export class TtsRequestMapperService {
  constructor(private readonly ttsGatewayConfig: TtsGatewayConfigService) {}

  mapRequest(request: TtsProviderRequest): TtsCompletionRequest {
    const { model } = this.ttsGatewayConfig.getConfig();
    const { text, languageCode } = request;

    return { model, text, languageCode };
  }
}
