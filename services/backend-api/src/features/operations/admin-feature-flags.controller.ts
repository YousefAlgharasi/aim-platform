import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { FeatureFlagService } from './feature-flag.service';
import {
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
} from './operations.dtos';
import { OperationsAdminGuard, OperationsAdminOnly } from './operations.guards';

@ApiTags('Admin Feature Flags')
@Controller('admin/feature-flags')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminFeatureFlagsController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Create a feature flag (admin)' })
  async createFlag(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFeatureFlagDto,
  ) {
    return this.featureFlagService.createFlag(
      {
        flagKey: dto.flagKey,
        name: dto.name,
        description: dto.description,
        enabled: false,
        rolloutPercentage: 0,
      },
      user.id,
    );
  }

  @Get()
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'List all feature flags (admin)' })
  async listFlags(@CurrentUser() user: AuthenticatedUser) {
    return this.featureFlagService.getFlags(user.id);
  }

  @Patch(':id')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Update a feature flag (admin)' })
  async updateFlag(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateFeatureFlagDto,
  ) {
    return this.featureFlagService.updateFlag(id, dto, user.id);
  }
}
