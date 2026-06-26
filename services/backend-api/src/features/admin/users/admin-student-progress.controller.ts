// AdminStudentProgressController.
//
// Scope: Admin read-only per-student lesson progress endpoints only.
//
// Endpoints:
//   GET /admin/students/:id/progress — Progress summary for one student.
//   GET /admin/students/:id/lessons  — Paginated per-lesson completion list.
//
// Security rules:
//   - Guarded by SupabaseJwtAuthGuard and RoleGuard — admin roles are
//     assigned via the DB roles table, consistent with AdminUsersController.
//   - Requires AuthorizedRole.ADMIN or AuthorizedRole.SUPER_ADMIN.
//   - Read-only — no writes to lesson_progress here.

import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';
import { AdminStudentProgressService } from './admin-student-progress.service';
import {
  StudentLessonProgressListResponse,
  StudentProgressSummary,
} from '../../lessons/lesson-progress.types';

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/students')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminStudentProgressController {
  constructor(private readonly studentProgress: AdminStudentProgressService) {}

  @Get(':id/progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get backend-computed lesson progress summary for a student (admin, read-only).' })
  @ApiParam({ name: 'id', description: 'Internal AIM user UUID of the student.' })
  @ApiOkResponse({ description: 'Progress summary. completionPct is backend-computed, never recalculated by the client.' })
  async getProgress(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StudentProgressSummary> {
    return this.studentProgress.getProgressSummary(id);
  }

  @Get(':id/lessons')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List per-lesson completion status for a student (admin, read-only).' })
  @ApiParam({ name: 'id', description: 'Internal AIM user UUID of the student.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Paginated per-lesson completion list.' })
  async getLessons(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<StudentLessonProgressListResponse> {
    return this.studentProgress.getLessonProgressList(
      id,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }
}
