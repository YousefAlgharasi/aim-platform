import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthResponse, VersionResponse } from './health.types';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }

  @Get('version')
  getVersion(): VersionResponse {
    return this.healthService.getVersion();
  }
}
