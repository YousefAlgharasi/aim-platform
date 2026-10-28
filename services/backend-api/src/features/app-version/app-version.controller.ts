import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { AppVersionService } from './app-version.service';
import { APP_PLATFORMS, AppPlatform, AppVersionPolicy } from './app-version.types';

// Public (no auth guard): the mobile client must be able to learn it is
// outdated before the user signs in.
@ApiTags(OPENAPI_TAGS.foundation)
@Controller('app')
export class AppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Get('version-policy')
  @ApiOperation({ summary: 'Return the mobile app version policy for a platform.' })
  @ApiQuery({ name: 'platform', enum: APP_PLATFORMS })
  @ApiOkResponse({ description: 'Minimum supported and latest app version, plus store link.' })
  async getVersionPolicy(@Query('platform') platform?: string): Promise<AppVersionPolicy> {
    if (!platform || !(APP_PLATFORMS as readonly string[]).includes(platform)) {
      throw new BadRequestException(`platform must be one of: ${APP_PLATFORMS.join(', ')}`);
    }
    return this.appVersionService.getPolicy(platform as AppPlatform);
  }
}
