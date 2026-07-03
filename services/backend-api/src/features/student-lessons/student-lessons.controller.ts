// StudentLessonsController.
//
// Scope: Student-facing enriched lesson list for the mobile Lesson List
// screen only (real per-student completion + current-lesson marker).
// Distinct from GET /curriculum/lessons, which stays the admin-facing
// content-management listing and is unaffected by this endpoint.
//
// Endpoints:
//   GET /student/lessons?chapterId= — published lessons with real progress.
//
// Security rules:
//   - All endpoints guarded by SupabaseJwtAuthGuard and RoleGuard, requiring
//     AuthorizedRole.STUDENT.
//   - studentId always resolved from the JWT — never from client input.

import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { StudentLessonsService } from './student-lessons.service';
import { StudentLessonsResponse } from './student-lessons.types';

@ApiTags('student-lessons')
@Controller('student/lessons')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class StudentLessonsController {
  constructor(private readonly studentLessonsService: StudentLessonsService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get published lessons under a chapter with the student's real completion and current-lesson marker.",
  })
  @ApiQuery({ name: 'chapterId', required: true, type: String })
  @ApiOkResponse({ description: 'Lesson list with progress. studentId always from JWT.' })
  async getLessons(
    @CurrentUser() user: AuthenticatedUser,
    @Query('chapterId') chapterId?: string,
  ): Promise<StudentLessonsResponse> {
    if (!chapterId) {
      throw new BadRequestException('chapterId query parameter is required');
    }
    return this.studentLessonsService.getLessons(user.id, chapterId);
  }
}
