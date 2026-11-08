// StudentHomeController.
//
// GET /student/home — one aggregated read for the student Home screen, replacing
// a dozen separate round trips. Read-only: it composes the services behind the
// existing endpoints and adds no logic of its own.
//
// Security: guarded like the endpoints it aggregates (JWT + STUDENT role);
// studentId always comes from the JWT, never from client input.

import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { LocaleHeadersInterceptor } from '../../common/locale/locale-headers.interceptor';
import { LocaleResolverService } from '../../common/locale/locale-resolver.service';
import { LocaleContext, RequestLocale } from '../../common/locale/request-locale.decorator';
import { StudentHomeService } from './student-home.service';
import { StudentHomeResponse } from './student-home.types';

@ApiTags('student-home')
@Controller('student/home')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class StudentHomeController {
  constructor(
    private readonly home: StudentHomeService,
    private readonly localeResolver: LocaleResolverService,
  ) {}

  @Get()
  @UseInterceptors(LocaleHeadersInterceptor)
  @ApiOperation({ summary: 'Everything the student Home screen shows, in one response.' })
  @ApiOkResponse({
    description:
      'Each section has the shape of its standalone endpoint. A section that failed is null and listed in failedSections.',
  })
  async getHome(
    @CurrentUser() user: AuthenticatedUser,
    @RequestLocale() localeCtx: LocaleContext,
  ): Promise<StudentHomeResponse> {
    const locale = await this.localeResolver.resolve(localeCtx);
    return this.home.getHome(user.id, locale);
  }
}
