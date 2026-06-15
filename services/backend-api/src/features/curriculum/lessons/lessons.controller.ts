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
import { LessonsService } from './lessons.service';
import { CreateLessonInput, UpdateLessonInput } from './lessons.types';

import { LessonPublishValidationService } from '../lesson-skills/lesson-publish-validation.service';

@ApiTags('curriculum')
@Controller('curriculum/lessons')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly lessonPublishValidationService: LessonPublishValidationService,
  ) {}

  @Get()
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'List lessons. Requires curriculum.read permission.' })
  @ApiQuery({ name: 'chapterId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'in_review', 'approved', 'published', 'archived'],
  })
  @ApiOkResponse({ description: 'Paginated lesson list.' })
  async listLessons(
    @Query('chapterId') chapterId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    return this.lessonsService.listLessons(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      chapterId,
      status,
      q,
    );
  }

  @Get(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'Get lesson by ID. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Lesson detail.' })
  @ApiNotFoundResponse({ description: 'Lesson not found.' })
  async getLesson(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.getLesson(id);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create lesson. Requires curriculum.write permission.' })
  @ApiCreatedResponse({ description: 'Lesson created in draft status.' })
  async createLesson(@Body() body: CreateLessonInput) {
    return this.lessonsService.createLesson(body);
  }

  @Get(':id/publish-validation')
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'Check if a lesson is ready for publishing. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Publish readiness status.' })
  @ApiNotFoundResponse({ description: 'Lesson not found.' })
  async checkPublishValidation(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonPublishValidationService.checkLessonPublishReadiness(id);
  }

  @Patch(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @ApiOperation({ summary: 'Update lesson. Requires curriculum.write permission.' })
  @ApiOkResponse({ description: 'Lesson updated.' })
  @ApiNotFoundResponse({ description: 'Lesson not found.' })
  async updateLesson(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateLessonInput,
  ) {
    return this.lessonsService.updateLesson(id, body);
  }
}
