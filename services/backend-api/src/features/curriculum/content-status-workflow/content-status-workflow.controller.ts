import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { PermissionGuard } from '../../../auth/authorization/permission.guard';
import { RequirePermissions } from '../../../auth/authorization/required-permissions.decorator';
import { CurriculumPermission } from '../curriculum.permissions';
import { ContentStatusWorkflowService } from './content-status-workflow.service';
import { WorkflowEntityType } from './content-status-workflow.types';

@ApiTags('curriculum-workflow')
@Controller('curriculum/workflow')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class ContentStatusWorkflowController {
  constructor(private readonly workflowService: ContentStatusWorkflowService) {}

  @Patch(':entityType/:entityId/publish')
  @RequirePermissions(CurriculumPermission.CONTENT_PUBLISH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish a curriculum entity. Requires curriculum.content.publish permission.',
  })
  @ApiParam({ name: 'entityType', enum: ['courses', 'levels', 'chapters', 'lessons', 'skills', 'objectives', 'questions'] })
  @ApiParam({ name: 'entityId', type: String })
  @ApiOkResponse({ description: 'Entity published.' })
  @ApiNotFoundResponse({ description: 'Entity not found.' })
  @ApiUnprocessableEntityResponse({ description: 'Transition not allowed or lesson missing published skill.' })
  async publish(
    @Param('entityType') entityType: WorkflowEntityType,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.workflowService.publish(entityType, entityId);
  }

  @Patch(':entityType/:entityId/archive')
  @RequirePermissions(CurriculumPermission.CONTENT_ARCHIVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive a curriculum entity. Requires curriculum.content.archive permission.',
  })
  @ApiParam({ name: 'entityType', enum: ['courses', 'levels', 'chapters', 'lessons', 'skills', 'objectives', 'questions'] })
  @ApiParam({ name: 'entityId', type: String })
  @ApiOkResponse({ description: 'Entity archived.' })
  @ApiNotFoundResponse({ description: 'Entity not found.' })
  @ApiUnprocessableEntityResponse({ description: 'Transition not allowed.' })
  async archive(
    @Param('entityType') entityType: WorkflowEntityType,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.workflowService.archive(entityType, entityId);
  }

  @Patch(':entityType/:entityId/restore')
  @RequirePermissions(CurriculumPermission.CONTENT_RESTORE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore an archived entity to draft. Requires curriculum.content.restore permission (SUPER_ADMIN only).',
  })
  @ApiParam({ name: 'entityType', enum: ['courses', 'levels', 'chapters', 'lessons', 'skills', 'objectives', 'questions'] })
  @ApiParam({ name: 'entityId', type: String })
  @ApiOkResponse({ description: 'Entity restored to draft.' })
  @ApiNotFoundResponse({ description: 'Entity not found.' })
  @ApiUnprocessableEntityResponse({ description: 'Transition not allowed.' })
  async restore(
    @Param('entityType') entityType: WorkflowEntityType,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.workflowService.restore(entityType, entityId);
  }
}
