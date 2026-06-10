import { Injectable } from '@nestjs/common';
import { AimEngineClientService } from './aim-engine-client.service';
import { AimEngineClientHealthResult } from './aim-engine-client.types';

@Injectable()
export class AimService {
  constructor(private readonly aimEngineClient: AimEngineClientService) {}

  checkEngineHealth(): Promise<AimEngineClientHealthResult> {
    return this.aimEngineClient.checkHealth();
  }
}
