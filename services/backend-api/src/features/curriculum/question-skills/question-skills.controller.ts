import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { PermissionGuard } from '../../../auth/authorization/permission.guard';
import { RequirePermissions } from '../../../auth/authorization/required-permissions.decorator';
import { CurriculumPermission } from '../curriculum.permissions';
import { QuestionSkillsService } from './question-skills.service';
import { AddSkillToQuestionInput } from './question-skills.types';

@ApiTags('curriculum')
@Controller('curriculum/questions/:questionId/skills')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class QuestionSkillsController {
  constructor(private readonly questionSkillsService: QuestionSkillsService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'List skills linked to a question. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Question-skill links.' })
  @ApiNotFoundResponse({ description: 'Question not found.' })
  async listSkillsForQuestion(@Param('questionId', ParseUUIDPipe) questionId: string) {
    return this.questionSkillsService.listSkillsForQuestion(questionId);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.SKILL_LINKS_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Link a skill to a question. Requires curriculum.skill_links.manage permission.' })
  @ApiCreatedResponse({ description: 'Skill linked to question.' })
  @ApiNotFoundResponse({ description: 'Question or skill not found.' })
  async addSkillToQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() body: AddSkillToQuestionInput,
  ) {
    return this.questionSkillsService.addSkillToQuestion(questionId, body);
  }

  @Put(':skillId/primary')
  @RequirePermissions(CurriculumPermission.SKILL_LINKS_MANAGE)
  @ApiOperation({
    summary:
      'Set a linked skill as the primary skill for a question. Requires curriculum.skill_links.manage permission.',
  })
  @ApiOkResponse({ description: 'Primary skill updated.' })
  @ApiNotFoundResponse({ description: 'Question, skill, or link not found.' })
  async setPrimarySkill(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ) {
    return this.questionSkillsService.setPrimarySkill(questionId, skillId);
  }

  @Delete(':skillId')
  @RequirePermissions(CurriculumPermission.SKILL_LINKS_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a skill from a question. Requires curriculum.skill_links.manage permission.' })
  @ApiNoContentResponse({ description: 'Skill unlinked from question.' })
  @ApiNotFoundResponse({ description: 'Question or skill link not found.' })
  async removeSkillFromQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ) {
    await this.questionSkillsService.removeSkillFromQuestion(questionId, skillId);
  }
}
