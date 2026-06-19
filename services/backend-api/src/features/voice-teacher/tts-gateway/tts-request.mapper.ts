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
