// StudentCoursesController.
//
// Scope: Student-facing enriched course list for the mobile Courses
// screen only (level badge, lesson count, real per-student progress).
// Distinct from GET /curriculum/courses, which stays the admin-facing
// content-management listing and is unaffected by this endpoint.
//
// Endpoints:
//   GET /student/courses — published courses with real progress.
//
// Security rules:
//   - All endpoints guarded by SupabaseJwtAuthGuard and RoleGuard, requiring
//     AuthorizedRole.STUDENT.
//   - studentId always resolved from the JWT — never from client input.

import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { LocaleHeadersInterceptor } from '../../common/locale/locale-headers.interceptor';
import { LocaleResolverService } from '../../common/locale/locale-resolver.service';
import { LocaleContext, RequestLocale } from '../../common/locale/request-locale.decorator';
import { StudentCoursesService } from './student-courses.service';
import { StudentCoursesResponse } from './student-courses.types';

@ApiTags('student-courses')
@Controller('student/courses')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
@UseInterceptors(LocaleHeadersInterceptor)
export class StudentCoursesController {
  constructor(
    private readonly studentCoursesService: StudentCoursesService,
    private readonly localeResolver: LocaleResolverService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      "Get published courses with the student's real lesson-progress percent, level badge, and lesson count.",
  })
  @ApiOkResponse({ description: 'Course list with progress. studentId always from JWT.' })
  async getCourses(
    @CurrentUser() user: AuthenticatedUser,
    @RequestLocale() localeCtx: LocaleContext,
  ): Promise<StudentCoursesResponse> {
    const locale = await this.localeResolver.resolve(localeCtx);
    return this.studentCoursesService.getCourses(user.id, locale);
  }
}
