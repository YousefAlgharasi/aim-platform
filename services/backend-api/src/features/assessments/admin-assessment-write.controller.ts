// AdminAssessmentWriteController.
//
// Scope: Admin metadata/lifecycle writes for assessments.
//
// Endpoints:
//   PATCH /admin/assessments/:id           — update title/description/status/
//                                             course-chapter link/settings.
//   PATCH /admin/assessments/:id/publish   — draft -> published.
//   PATCH /admin/assessments/:id/unpublish — published -> draft.
//
// Security rules:
//   - Guarded by SupabaseJwtAuthGuard and RoleGuard — admin roles only.
//   - Grading, scoring, and pass/fail are never accepted or computed here.

import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { ResolvedInternalUserId } from '../../auth/current-user.decorator';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { AdminAssessmentWriteService } from './admin-assessment-write.service';
import { CreateAssessmentDto, UpdateAssessmentDto } from './admin-assessment-write.dto';

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/assessments')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminAssessmentWriteController {
  constructor(private readonly write: AdminAssessmentWriteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new draft assessment (quiz or exam).' })
  @ApiCreatedResponse({ description: 'Created assessment detail.' })
  async create(@Body() dto: CreateAssessmentDto, @ResolvedInternalUserId() createdBy: string) {
    return this.write.create(dto, createdBy);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update assessment title/description/status/course-chapter link/settings.' })
  @ApiParam({ name: 'id', description: 'Assessment UUID.' })
  @ApiOkResponse({ description: 'Updated assessment detail.' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateAssessmentDto) {
    return this.write.update(id, dto);
  }

  @Patch(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a draft assessment.' })
  @ApiParam({ name: 'id', description: 'Assessment UUID.' })
  @ApiOkResponse({ description: 'Updated assessment detail.' })
  async publish(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.write.publish(id);
  }

  @Patch(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish a published assessment back to draft.' })
  @ApiParam({ name: 'id', description: 'Assessment UUID.' })
  @ApiOkResponse({ description: 'Updated assessment detail.' })
  async unpublish(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.write.unpublish(id);
  }
}
