import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OPENAPI_TAGS } from '../openapi/openapi.tags';
import { HealthResponse, VersionResponse } from './health.types';
import { HealthService } from './health.service';

@ApiTags(OPENAPI_TAGS.foundation)
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  @ApiOperation({ summary: 'Return backend health metadata.' })
  @ApiOkResponse({ description: 'Backend health metadata.' })
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }

  @Get('version')
  @ApiOperation({ summary: 'Return backend version metadata.' })
  @ApiOkResponse({ description: 'Backend version metadata.' })
  getVersion(): VersionResponse {
    return this.healthService.getVersion();
  }
}
