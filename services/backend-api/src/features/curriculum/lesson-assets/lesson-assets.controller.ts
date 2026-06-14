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
import { LessonAssetsService } from './lesson-assets.service';
import { CreateLessonAssetInput, UpdateLessonAssetInput } from './lesson-assets.types';

@ApiTags('curriculum')
@Controller('curriculum/lesson-assets')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class LessonAssetsController {
  constructor(private readonly lessonAssetsService: LessonAssetsService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.READ)
  @ApiOperation({ summary: 'List lesson assets. Requires curriculum.read permission.' })
  @ApiQuery({ name: 'lessonId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'published', 'archived'],
  })
  @ApiOkResponse({ description: 'Paginated lesson asset list.' })
  async listAssets(
    @Query('lessonId') lessonId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    return this.lessonAssetsService.listAssets(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      lessonId,
      status,
    );
  }

  @Get(':id')
  @RequirePermissions(CurriculumPermission.READ)
  @ApiOperation({ summary: 'Get lesson asset by ID. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Lesson asset detail.' })
  @ApiNotFoundResponse({ description: 'Asset not found.' })
  async getAsset(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonAssetsService.getAsset(id);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create lesson asset. Requires curriculum.write permission.' })
  @ApiCreatedResponse({ description: 'Asset created in draft status.' })
  async createAsset(@Body() body: CreateLessonAssetInput) {
    return this.lessonAssetsService.createAsset(body);
  }

  @Patch(':id')
  @RequirePermissions(CurriculumPermission.WRITE)
  @ApiOperation({ summary: 'Update lesson asset. Requires curriculum.write permission.' })
  @ApiOkResponse({ description: 'Asset updated.' })
  @ApiNotFoundResponse({ description: 'Asset not found.' })
  async updateAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateLessonAssetInput,
  ) {
    return this.lessonAssetsService.updateAsset(id, body);
  }

  @Post(':id/archive')
  @RequirePermissions(CurriculumPermission.ARCHIVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive lesson asset. Requires curriculum.archive permission.' })
  @ApiOkResponse({ description: 'Asset archived.' })
  @ApiNotFoundResponse({ description: 'Asset not found.' })
  async archiveAsset(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonAssetsService.archiveAsset(id);
  }
}
