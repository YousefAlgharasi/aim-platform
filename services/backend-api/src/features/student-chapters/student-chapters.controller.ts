// StudentChaptersController.
//
// Scope: Student-facing enriched chapter list for the mobile Chapter List
// screen only (level code, lesson count, real per-student progress).
// Distinct from GET /curriculum/chapters, which stays the admin-facing
// content-management listing and is unaffected by this endpoint.
//
// Endpoints:
//   GET /student/chapters?levelId= — published chapters with real progress.
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
import { StudentChaptersService } from './student-chapters.service';
import { StudentChaptersResponse } from './student-chapters.types';

@ApiTags('student-chapters')
@Controller('student/chapters')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class StudentChaptersController {
  constructor(private readonly studentChaptersService: StudentChaptersService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get published chapters under a level with the student's real lesson-progress percent, level code, and lesson count.",
  })
  @ApiQuery({ name: 'levelId', required: true, type: String })
  @ApiOkResponse({ description: 'Chapter list with progress. studentId always from JWT.' })
  async getChapters(
    @CurrentUser() user: AuthenticatedUser,
    @Query('levelId') levelId?: string,
  ): Promise<StudentChaptersResponse> {
    if (!levelId) {
      throw new BadRequestException('levelId query parameter is required');
    }
    return this.studentChaptersService.getChapters(user.id, levelId);
  }
}
