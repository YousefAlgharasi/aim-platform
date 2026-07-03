import { Injectable } from '@nestjs/common';

import { BackendConfigService } from '../../../config/backend-config.service';

export interface TtsGatewayConfig {
  readonly apiKey: string;
  readonly model: string;
  readonly baseUrl: string;
}

@Injectable()
export class TtsGatewayConfigService {
  constructor(private readonly backendConfig: BackendConfigService) {}

  getConfig(): TtsGatewayConfig {
    const { apiKey, model, baseUrl } = this.backendConfig.ttsProvider;
    return { apiKey, model, baseUrl };
  }
}
