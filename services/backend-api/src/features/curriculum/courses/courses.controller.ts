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
import { CoursesService } from './courses.service';
import { CreateCourseInput, UpdateCourseInput } from './courses.types';

@ApiTags('curriculum')
@Controller('curriculum/courses')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.CONTENT_READ_PUBLISHED)
  @ApiOperation({ summary: 'List courses. Requires curriculum.read permission.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'in_review', 'approved', 'published', 'archived'],
  })
  @ApiOkResponse({ description: 'Paginated course list.' })
  async listCourses(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    return this.coursesService.listCourses(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      status,
      q,
    );
  }

  @Get(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_READ_PUBLISHED)
  @ApiOperation({ summary: 'Get course by ID. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Course detail.' })
  @ApiNotFoundResponse({ description: 'Course not found.' })
  async getCourse(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getCourse(id);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create course. Requires curriculum.write permission.' })
  @ApiCreatedResponse({ description: 'Course created in draft status.' })
  async createCourse(@Body() body: CreateCourseInput) {
    return this.coursesService.createCourse(body);
  }

  @Patch(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @ApiOperation({ summary: 'Update course. Requires curriculum.write permission.' })
  @ApiOkResponse({ description: 'Course updated.' })
  @ApiNotFoundResponse({ description: 'Course not found.' })
  async updateCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCourseInput,
  ) {
    return this.coursesService.updateCourse(id, body);
  }
}
