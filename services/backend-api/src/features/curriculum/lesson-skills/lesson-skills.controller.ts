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
import { LessonSkillsService } from './lesson-skills.service';
import { AddSkillToLessonInput } from './lesson-skills.types';

@ApiTags('curriculum')
@Controller('curriculum/lessons/:lessonId/skills')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class LessonSkillsController {
  constructor(private readonly lessonSkillsService: LessonSkillsService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'List skills linked to a lesson. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Lesson-skill links.' })
  @ApiNotFoundResponse({ description: 'Lesson not found.' })
  async listSkillsForLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.lessonSkillsService.listSkillsForLesson(lessonId);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Link a skill to a lesson. Requires curriculum.write permission.' })
  @ApiCreatedResponse({ description: 'Skill linked to lesson.' })
  @ApiNotFoundResponse({ description: 'Lesson or skill not found.' })
  async addSkillToLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() body: AddSkillToLessonInput,
  ) {
    return this.lessonSkillsService.addSkillToLesson(lessonId, body);
  }

  @Delete(':skillId')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a skill from a lesson. Requires curriculum.write permission.' })
  @ApiNoContentResponse({ description: 'Skill unlinked from lesson.' })
  @ApiNotFoundResponse({ description: 'Lesson or skill link not found.' })
  async removeSkillFromLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ) {
    await this.lessonSkillsService.removeSkillFromLesson(lessonId, skillId);
  }
}
