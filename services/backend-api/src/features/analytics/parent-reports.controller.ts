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
 * Backend-approved parent-facing analytics reports (distinct from the
 * per-child progress/assessment/activity reads in ParentsController, which
 * are gated by ParentChildAccessGuard + consent). These report definitions
 * are scoped to the parent's own account/category and are never assembled
 * client-side — ReportRunnerService is the sole authority for output.
 */
@ApiTags('Parent Analytics')
@Controller('parent/analytics/reports')
@UseGuards(SupabaseJwtAuthGuard, AnalyticsAccessGuard)
export class ParentReportsController {
  constructor(
    private readonly reportDefinitionService: ReportDefinitionService,
    private readonly reportRunnerService: ReportRunnerService,
  ) {}

  @Get()
  @RequireAnalyticsAccess({ category: 'parent', action: 'view_dashboard' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List report definitions visible to the authenticated parent' })
  async listReports(@CurrentAnalyticsActor() actor: AnalyticsActor) {
    return this.reportDefinitionService.listVisibleToRole(actor.role);
  }

  @Post(':reportKey/run')
  @RequireAnalyticsAccess({ category: 'parent', action: 'run_report' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run a parent-facing report' })
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
  @RequireAnalyticsAccess({ category: 'parent', action: 'view_dashboard' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the status/result reference of a parent report run' })
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
