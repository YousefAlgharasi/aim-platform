import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { AdminDataService } from './admin-data.service';

@ApiTags(OPENAPI_TAGS.admin)
@Controller('admin')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class AdminDataController {
  constructor(private readonly adminDataService: AdminDataService) {}

  @Get('assessments')
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List assessments.' })
  @ApiOkResponse({ description: 'Paginated list of assessments.' })
  async listAssessments(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('type') type?: string,
  ) {
    return this.adminDataService.listAssessments(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      type,
    );
  }

  @Get('deadlines')
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List assessment deadlines.' })
  @ApiOkResponse({ description: 'Paginated list of deadlines.' })
  async listDeadlines(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminDataService.listDeadlines(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
    );
  }

  @Get('assessment-results')
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List assessment results.' })
  @ApiOkResponse({ description: 'Paginated list of assessment results.' })
  async listAssessmentResults(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('studentId') studentId?: string,
    @Query('assessmentId') assessmentId?: string,
  ) {
    return this.adminDataService.listAssessmentResults(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      { studentId, assessmentId },
    );
  }

  @Get('placement/results')
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List placement results.' })
  @ApiOkResponse({ description: 'Paginated list of placement results.' })
  async listPlacementResults(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminDataService.listPlacementResults(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
    );
  }

  @Get('session-summaries')
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List session summaries.' })
  @ApiOkResponse({ description: 'Paginated list of session summaries.' })
  async listSessionSummaries(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('studentId') studentId?: string,
  ) {
    return this.adminDataService.listSessionSummaries(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      studentId,
    );
  }

  @Get('audit-logs')
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List audit logs.' })
  @ApiOkResponse({ description: 'Paginated list of audit logs.' })
  async listAuditLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminDataService.listAuditLogs(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      { userId, action, from, to },
    );
  }

  @Get('activity-logs')
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List activity logs.' })
  @ApiOkResponse({ description: 'Paginated list of activity logs.' })
  async listActivityLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('userId') userId?: string,
    @Query('eventType') eventType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminDataService.listActivityLogs(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      { userId, eventType, from, to },
    );
  }

  @Get('reports/enrollments')
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get enrollment report.' })
  @ApiOkResponse({ description: 'Enrollment report.' })
  async getEnrollmentReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminDataService.getEnrollmentReport(from, to);
  }

  @Get('reports/assessments')
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get assessment report.' })
  @ApiOkResponse({ description: 'Assessment report.' })
  async getAssessmentReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminDataService.getAssessmentReport(from, to);
  }

  @Get('reports/active-users')
  @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get active users report.' })
  @ApiOkResponse({ description: 'Active users report.' })
  async getActiveUsersReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminDataService.getActiveUsersReport(from, to);
  }
}
