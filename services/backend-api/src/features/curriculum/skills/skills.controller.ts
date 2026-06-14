import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { PermissionGuard } from '../../../auth/authorization/permission.guard';
import { RequirePermissions } from '../../../auth/authorization/required-permissions.decorator';
import { CurriculumPermission } from '../curriculum.permissions';
import { SkillsService } from './skills.service';
import { SKILL_DOMAINS, CreateSkillInput, UpdateSkillInput } from './skills.types';

@ApiTags('curriculum')
@Controller('curriculum/skills')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'List skills. Requires curriculum.read permission.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'domain', required: false, enum: SKILL_DOMAINS })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'in_review', 'approved', 'published', 'archived'],
  })
  @ApiOkResponse({ description: 'Paginated skill list.' })
  async listSkills(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('domain') domain?: string,
    @Query('status') status?: string,
  ) {
    return this.skillsService.listSkills(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      domain,
      status,
    );
  }

  @Get('by-key/:key')
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'Get skill by stable key. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Skill detail.' })
  @ApiNotFoundResponse({ description: 'Skill not found.' })
  async getSkillByKey(@Param('key') key: string) {
    return this.skillsService.getSkillByKey(key);
  }

  @Get(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'Get skill by ID. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Skill detail.' })
  @ApiNotFoundResponse({ description: 'Skill not found.' })
  async getSkill(@Param('id', ParseUUIDPipe) id: string) {
    return this.skillsService.getSkill(id);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create skill. Requires curriculum.write permission.' })
  @ApiCreatedResponse({ description: 'Skill created in draft status.' })
  async createSkill(@Body() body: CreateSkillInput) {
    return this.skillsService.createSkill(body);
  }

  @Patch(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @ApiOperation({ summary: 'Update skill title/description. Requires curriculum.write permission.' })
  @ApiOkResponse({ description: 'Skill updated.' })
  @ApiNotFoundResponse({ description: 'Skill not found.' })
  async updateSkill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSkillInput,
  ) {
    return this.skillsService.updateSkill(id, body);
  }
}
