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
import { LessonObjectivesService } from './lesson-objectives.service';
import { AddObjectiveToLessonInput } from './lesson-objectives.types';

@ApiTags('curriculum')
@Controller('curriculum/lessons/:lessonId/objectives')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class LessonObjectivesController {
  constructor(private readonly lessonObjectivesService: LessonObjectivesService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.READ)
  @ApiOperation({
    summary: 'List objectives linked to a lesson. Requires curriculum.read permission.',
  })
  @ApiOkResponse({ description: 'Lesson-objective links.' })
  @ApiNotFoundResponse({ description: 'Lesson not found.' })
  async listObjectivesForLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.lessonObjectivesService.listObjectivesForLesson(lessonId);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Link an objective to a lesson. Requires curriculum.write permission.',
  })
  @ApiCreatedResponse({ description: 'Objective linked to lesson.' })
  @ApiNotFoundResponse({ description: 'Lesson or objective not found.' })
  async addObjectiveToLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() body: AddObjectiveToLessonInput,
  ) {
    return this.lessonObjectivesService.addObjectiveToLesson(lessonId, body);
  }

  @Delete(':objectiveId')
  @RequirePermissions(CurriculumPermission.WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove an objective from a lesson. Requires curriculum.write permission.',
  })
  @ApiNoContentResponse({ description: 'Objective unlinked from lesson.' })
  @ApiNotFoundResponse({ description: 'Lesson or objective link not found.' })
  async removeObjectiveFromLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('objectiveId', ParseUUIDPipe) objectiveId: string,
  ) {
    await this.lessonObjectivesService.removeObjectiveFromLesson(lessonId, objectiveId);
  }
}
