// P18-049: Create Admin AI Model Config API
//
// Endpoints (admin/super_admin only):
//   GET  /admin/ai/model-configs                     — List all model configs, any status.
//   GET  /admin/ai/model-configs/:id                  — Read one model config.
//   POST /admin/ai/model-configs/:id/status           — Change status (draft/active/retired).
//   POST /admin/ai/model-configs/:id/limits           — Update limits/parameters.
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard) and ADMIN/
//     SUPER_ADMIN role (RoleGuard), same pattern as AdminRolesController.
//   - provider_key_ref is returned only as a non-secret reference string;
//     the underlying provider credential is never read, resolved, or
//     returned here.
//   - Computes no mastery/level/weakness/difficulty/recommendation/
//     review-schedule value.

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';

import { ModelConfigService } from '../governance/model-config.service';
import { AiModelConfigRow } from '../governance/governance-repository.types';
import { UpdateModelConfigLimitsDto, UpdateModelConfigStatusDto } from './admin-model-config.dto';

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/ai/model-configs')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminModelConfigController {
  constructor(private readonly modelConfigService: ModelConfigService) {}

  @Get()
  @ApiOperation({ summary: 'List all AI model configs, any status. Admin only.' })
  @ApiOkResponse({ description: 'All model config rows.' })
  async listAll(): Promise<AiModelConfigRow[]> {
    return this.modelConfigService.listAllConfigs();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Read one AI model config by id. Admin only.' })
  @ApiParam({ name: 'id', description: 'UUID of the model config.' })
  @ApiOkResponse({ description: 'The model config.' })
  async getById(@Param('id') id: string): Promise<AiModelConfigRow> {
    return this.modelConfigService.getById(id);
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Change a model config status (draft/active/retired). Admin only.' })
  @ApiParam({ name: 'id', description: 'UUID of the model config.' })
  @ApiOkResponse({ description: 'The updated model config.' })
  async setStatus(@Param('id') id: string, @Body() body: unknown): Promise<AiModelConfigRow> {
    const dto = UpdateModelConfigStatusDto.fromBody(body);
    return this.modelConfigService.setStatus(id, dto.status);
  }

  @Post(':id/limits')
  @ApiOperation({ summary: 'Update a model config limits/parameters. Admin only.' })
  @ApiParam({ name: 'id', description: 'UUID of the model config.' })
  @ApiOkResponse({ description: 'The updated model config.' })
  async updateLimits(@Param('id') id: string, @Body() body: unknown): Promise<AiModelConfigRow> {
    const dto = UpdateModelConfigLimitsDto.fromBody(body);
    return this.modelConfigService.updateLimitsAndParameters(id, dto.limits, dto.parameters);
  }
}
