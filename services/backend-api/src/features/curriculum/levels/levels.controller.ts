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
import { LevelsService } from './levels.service';
import { CreateLevelInput, UpdateLevelInput } from './levels.types';

@ApiTags('curriculum')
@Controller('curriculum/courses/:courseId/levels')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.READ)
  @ApiOperation({ summary: 'List levels for a course. Requires curriculum.read permission.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'in_review', 'approved', 'published', 'archived'],
  })
  @ApiOkResponse({ description: 'Paginated level list.' })
  async listLevels(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    return this.levelsService.listLevels(
      courseId,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      status,
    );
  }

  @Get(':id')
  @RequirePermissions(CurriculumPermission.READ)
  @ApiOperation({ summary: 'Get level by ID. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Level detail.' })
  @ApiNotFoundResponse({ description: 'Level not found.' })
  async getLevel(@Param('id', ParseUUIDPipe) id: string) {
    return this.levelsService.getLevel(id);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create level under a course. Requires curriculum.write permission.' })
  @ApiCreatedResponse({ description: 'Level created in draft status.' })
  async createLevel(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() body: Omit<CreateLevelInput, 'courseId'>,
  ) {
    return this.levelsService.createLevel({ ...body, courseId });
  }

  @Patch(':id')
  @RequirePermissions(CurriculumPermission.WRITE)
  @ApiOperation({ summary: 'Update level. Requires curriculum.write permission.' })
  @ApiOkResponse({ description: 'Level updated.' })
  @ApiNotFoundResponse({ description: 'Level not found.' })
  async updateLevel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateLevelInput,
  ) {
    return this.levelsService.updateLevel(id, body);
  }
}
