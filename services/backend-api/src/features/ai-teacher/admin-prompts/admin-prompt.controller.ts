// P18-048: Create Admin AI Prompt Management API
//
// Endpoints (admin/super_admin only):
//   GET  /admin/ai/prompts                — List all prompt templates (any status).
//   GET  /admin/ai/prompts/:id            — Read one prompt template.
//   POST /admin/ai/prompts                — Create a new draft version.
//   POST /admin/ai/prompts/:id/publish    — Publish a draft/retired version as active,
//                                            retiring any previously active version for
//                                            the same (name, locale, audience).
//   POST /admin/ai/prompts/:id/retire     — Retire a version.
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard) and ADMIN/
//     SUPER_ADMIN role (RoleGuard), the same pattern as AdminRolesController.
//   - Prompt template resolution authority (which version is "active") stays
//     entirely server-side; a draft body is never trusted as the live
//     template until an explicit publish call from an admin.
//   - No provider secrets, API keys, or model secrets are read or returned
//     here — this controller only manages prompt template rows.
//   - Computes no mastery/level/weakness/difficulty/recommendation/
//     review-schedule value.

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';

import { PromptTemplateService } from '../governance/prompt-template.service';
import { AiPromptTemplateRow } from '../governance/governance-repository.types';
import { CreatePromptTemplateDraftDto } from './admin-prompt.dto';

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/ai/prompts')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminPromptController {
  constructor(private readonly promptTemplateService: PromptTemplateService) {}

  @Get()
  @ApiOperation({ summary: 'List all AI prompt templates, any status. Admin only.' })
  @ApiOkResponse({ description: 'All prompt template versions.' })
  async listAll(): Promise<AiPromptTemplateRow[]> {
    return this.promptTemplateService.listAllTemplates();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Read one AI prompt template by id. Admin only.' })
  @ApiParam({ name: 'id', description: 'UUID of the prompt template.' })
  @ApiOkResponse({ description: 'The prompt template.' })
  async getById(@Param('id') id: string): Promise<AiPromptTemplateRow> {
    return this.promptTemplateService.getTemplateById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new draft prompt template version. Admin only.' })
  @ApiCreatedResponse({ description: 'Draft prompt template created.' })
  async createDraft(@Body() body: unknown): Promise<AiPromptTemplateRow> {
    const dto = CreatePromptTemplateDraftDto.fromBody(body);
    return this.promptTemplateService.createDraftTemplate(dto);
  }

  @Post(':id/publish')
  @ApiOperation({
    summary:
      'Publish a draft/retired prompt template version as active, retiring any ' +
      'previously active version for the same name/locale/audience. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the prompt template to publish.' })
  @ApiOkResponse({ description: 'The published (now active) prompt template.' })
  async publish(@Param('id') id: string): Promise<AiPromptTemplateRow> {
    return this.promptTemplateService.publishTemplate(id);
  }

  @Post(':id/retire')
  @ApiOperation({ summary: 'Retire a prompt template version. Admin only.' })
  @ApiParam({ name: 'id', description: 'UUID of the prompt template to retire.' })
  @ApiOkResponse({ description: 'The retired prompt template.' })
  async retire(@Param('id') id: string): Promise<AiPromptTemplateRow> {
    return this.promptTemplateService.retireTemplate(id);
  }
}
