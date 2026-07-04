import { Injectable } from '@nestjs/common';

import { BackendConfigService } from '../../../config/backend-config.service';

export interface TtsGatewayConfig {
  readonly apiKey: string;
  readonly model: string;
  readonly baseUrl: string;
  readonly voice: string;
  readonly resultsUrl: string;
}

@Injectable()
export class TtsGatewayConfigService {
  constructor(private readonly backendConfig: BackendConfigService) {}

  getConfig(): TtsGatewayConfig {
    const { apiKey, model, baseUrl, voice, resultsUrl } = this.backendConfig.ttsProvider;
    return { apiKey, model, baseUrl, voice, resultsUrl };
  }
}
