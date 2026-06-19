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
