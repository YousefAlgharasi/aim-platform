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
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveInput, UpdateObjectiveInput } from './objectives.types';

@ApiTags('curriculum')
@Controller('curriculum/objectives')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'List objectives. Requires curriculum.read permission.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'in_review', 'approved', 'published', 'archived'],
  })
  @ApiOkResponse({ description: 'Paginated objective list.' })
  async listObjectives(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    return this.objectivesService.listObjectives(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      status,
    );
  }

  @Get('by-key/:key')
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'Get objective by stable key. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Objective detail.' })
  @ApiNotFoundResponse({ description: 'Objective not found.' })
  async getObjectiveByKey(@Param('key') key: string) {
    return this.objectivesService.getObjectiveByKey(key);
  }

  @Get(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'Get objective by ID. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Objective detail.' })
  @ApiNotFoundResponse({ description: 'Objective not found.' })
  async getObjective(@Param('id', ParseUUIDPipe) id: string) {
    return this.objectivesService.getObjective(id);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create objective. Requires curriculum.write permission.' })
  @ApiCreatedResponse({ description: 'Objective created in draft status.' })
  async createObjective(@Body() body: CreateObjectiveInput) {
    return this.objectivesService.createObjective(body);
  }

  @Patch(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @ApiOperation({ summary: 'Update objective. Requires curriculum.write permission.' })
  @ApiOkResponse({ description: 'Objective updated.' })
  @ApiNotFoundResponse({ description: 'Objective not found.' })
  async updateObjective(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateObjectiveInput,
  ) {
    return this.objectivesService.updateObjective(id, body);
  }
}
