// StudentCoursePathController.
//
// GET /student/courses/:courseId/path — a course's whole learning path in one
// read (levels, chapters, final exam, active chapter with lessons). Read-only;
// it composes the services behind /student/chapters and /student/lessons.
//
// Security: JWT + STUDENT role; studentId comes from the JWT; the course is
// checked with the same assertCanView the chapter/lesson endpoints use.

import { Controller, Get, Param, ParseUUIDPipe, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { LocaleHeadersInterceptor } from '../../common/locale/locale-headers.interceptor';
import { LocaleResolverService } from '../../common/locale/locale-resolver.service';
import { LocaleContext, RequestLocale } from '../../common/locale/request-locale.decorator';
import { CourseAccessService } from '../course-billing/course-access.service';
import { StudentCoursePathService } from './student-course-path.service';
import { StudentCoursePathResponse } from './student-course-path.types';

@ApiTags('student-courses')
@Controller('student/courses/:courseId/path')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class StudentCoursePathController {
  constructor(
    private readonly path: StudentCoursePathService,
    private readonly courseAccess: CourseAccessService,
    private readonly localeResolver: LocaleResolverService,
  ) {}

  @Get()
  @UseInterceptors(LocaleHeadersInterceptor)
  @ApiOperation({ summary: "A course's learning path: levels, chapters, final exam and the active chapter's lessons." })
  @ApiParam({ name: 'courseId', description: 'UUID of the course.' })
  @ApiOkResponse({ description: 'Course path with backend-computed progress. studentId always from JWT.' })
  async getPath(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: AuthenticatedUser,
    @RequestLocale() localeCtx: LocaleContext,
  ): Promise<StudentCoursePathResponse> {
    await this.courseAccess.assertCanView(user.id, courseId);
    const locale = await this.localeResolver.resolve(localeCtx);
    return this.path.getPath(user.id, courseId, locale);
  }
}
