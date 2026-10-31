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

import { BadRequestException, Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { StudentLessonsService } from './student-lessons.service';
import { CourseAccessService } from '../course-billing/course-access.service';
import { StudentLessonsResponse } from './student-lessons.types';
import { LocaleHeadersInterceptor } from '../../common/locale/locale-headers.interceptor';
import { LocaleResolverService } from '../../common/locale/locale-resolver.service';
import { LocaleContext, RequestLocale } from '../../common/locale/request-locale.decorator';

@ApiTags('student-lessons')
@Controller('student/lessons')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
@UseInterceptors(LocaleHeadersInterceptor)
export class StudentLessonsController {
  constructor(
    private readonly studentLessonsService: StudentLessonsService,
    private readonly courseAccess: CourseAccessService,
    private readonly localeResolver: LocaleResolverService,
  ) {}

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
    @RequestLocale() localeCtx?: LocaleContext,
  ): Promise<StudentLessonsResponse> {
    if (!chapterId) {
      throw new BadRequestException('chapterId query parameter is required');
    }
    await this.courseAccess.assertAccess(user.id, await this.courseAccess.courseIdForChapter(chapterId));
    const locale = await this.localeResolver.resolve(localeCtx ?? { requested: null, userId: user.id });
    return this.studentLessonsService.getLessons(user.id, chapterId, locale);
  }
}
