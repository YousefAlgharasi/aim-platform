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
import { ChaptersService } from './chapters.service';
import { CreateChapterInput, UpdateChapterInput } from './chapters.types';

@ApiTags('curriculum')
@Controller('curriculum/chapters')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'List chapters. Requires curriculum.read permission.' })
  @ApiQuery({ name: 'levelId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'in_review', 'approved', 'published', 'archived'],
  })
  @ApiOkResponse({ description: 'Paginated chapter list.' })
  async listChapters(
    @Query('levelId') levelId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    return this.chaptersService.listChapters(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      levelId,
      status,
      q,
    );
  }

  @Get(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'Get chapter by ID. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Chapter detail.' })
  @ApiNotFoundResponse({ description: 'Chapter not found.' })
  async getChapter(@Param('id', ParseUUIDPipe) id: string) {
    return this.chaptersService.getChapter(id);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create chapter. Requires curriculum.write permission.' })
  @ApiCreatedResponse({ description: 'Chapter created in draft status.' })
  async createChapter(@Body() body: CreateChapterInput) {
    return this.chaptersService.createChapter(body);
  }

  @Patch(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @ApiOperation({ summary: 'Update chapter. Requires curriculum.write permission.' })
  @ApiOkResponse({ description: 'Chapter updated.' })
  @ApiNotFoundResponse({ description: 'Chapter not found.' })
  async updateChapter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateChapterInput,
  ) {
    return this.chaptersService.updateChapter(id, body);
  }
}
