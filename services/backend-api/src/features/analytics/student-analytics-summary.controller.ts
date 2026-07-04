import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AnalyticsAccessGuard } from './analytics-access.guard';
import { RequireAnalyticsAccess } from './analytics-access.decorator';
import { CurrentAnalyticsActor, AnalyticsActor } from './current-analytics-actor.decorator';
import { ReportDefinitionService } from './report-definition.service';
import { ReportRunnerService } from './report-runner.service';
import { RunReportDto } from './analytics.dtos';

/**
 * Backend-approved student-facing analytics summary. Returns only the
 * report definitions visible to the student role; the student never
 * computes their own progress/mastery figures — those are produced
 * elsewhere by backend-owned services and surfaced via ReportRunnerService
 * report runs, never assembled client-side.
 *
 * P20-023: Added run/status endpoints (mirroring ParentReportsController's
 * exact pattern) — previously this controller only listed report
 * *definitions*, with no way for a student to actually run one (e.g.
 * 'student_aim_progress') and get back computed data.
 */
@ApiTags('Student Analytics')
@Controller('student/analytics/summary')
@UseGuards(SupabaseJwtAuthGuard, AnalyticsAccessGuard)
export class StudentAnalyticsSummaryController {
  constructor(
    private readonly reportDefinitionService: ReportDefinitionService,
    private readonly reportRunnerService: ReportRunnerService,
  ) {}

  @Get()
  @RequireAnalyticsAccess({ category: 'student', action: 'view_dashboard' })
  @ApiBearerAuth()
  @ApiOperation({ summary: "List backend-approved analytics summary reports visible to the authenticated student" })
  async getSummary(@CurrentAnalyticsActor() actor: AnalyticsActor) {
    return this.reportDefinitionService.listVisibleToRole(actor.role);
  }

  @Post(':reportKey/run')
  @RequireAnalyticsAccess({ category: 'student', action: 'run_report' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run a student-facing report (e.g. student_aim_progress)' })
  async runReport(
    @Param('reportKey') reportKey: string,
    @Body() body: RunReportDto,
    @CurrentAnalyticsActor() actor: AnalyticsActor,
  ) {
    return this.reportRunnerService.runReport({
      reportKey,
      requestedByUserId: actor.userId,
      requestedRole: actor.role,
      parameters: body.parameters ?? {},
    });
  }

  @Get('runs/:runId')
  @RequireAnalyticsAccess({ category: 'student', action: 'view_dashboard' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the status/result of a student report run' })
  async getRunStatus(
    @Param('runId') runId: string,
    @CurrentAnalyticsActor() actor: AnalyticsActor,
  ) {
    const run = await this.reportRunnerService.getRunStatus(runId);

    if (run.requestedByUserId !== actor.userId) {
      throw new ForbiddenException('You may only view report runs you requested');
    }

    return run;
  }
}
