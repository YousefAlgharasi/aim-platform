import { BadRequestException, Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../../auth/authenticated-user';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { OperationsAdminGuard, OperationsAdminOnly } from '../operations/operations.guards';
import { UpdateAppVersionPolicyDto } from './app-version.dtos';
import { AppVersionService } from './app-version.service';
import { APP_PLATFORMS, AppPlatform, AppVersionPolicy } from './app-version.types';

@ApiTags('Admin App Versions')
@Controller('admin/app-versions')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminAppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Get()
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'List the mobile app version policy for every platform (admin)' })
  async list(): Promise<AppVersionPolicy[]> {
    return this.appVersionService.listPolicies();
  }

  @Patch(':platform')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Update the mobile app version policy for a platform (admin)' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('platform') platform: string,
    @Body() dto: UpdateAppVersionPolicyDto,
  ): Promise<AppVersionPolicy> {
    if (!(APP_PLATFORMS as readonly string[]).includes(platform)) {
      throw new BadRequestException(`platform must be one of: ${APP_PLATFORMS.join(', ')}`);
    }
    return this.appVersionService.updatePolicy(platform as AppPlatform, dto, req.internalUserId!);
  }
}
