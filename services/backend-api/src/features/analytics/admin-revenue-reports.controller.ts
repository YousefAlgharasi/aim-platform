import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AnalyticsAccessGuard } from './analytics-access.guard';
import { RequireAnalyticsAccess } from './analytics-access.decorator';
import { CurrentAnalyticsActor, AnalyticsActor } from './current-analytics-actor.decorator';
import { ReportDefinitionService } from './report-definition.service';
import { ReportRunnerService } from './report-runner.service';
import { RunReportDto } from './analytics.dtos';

/**
 * Backend-approved admin revenue reports only, built from safe billing
 * aggregates. This controller never reads raw payment payloads or
 * provider tokens — ReportRunnerService assembles output from
 * backend-owned aggregate data only.
 */
@ApiTags('Admin Analytics')
@Controller('admin/analytics/reports/revenue')
@UseGuards(SupabaseJwtAuthGuard, AnalyticsAccessGuard)
export class AdminRevenueReportsController {
  constructor(
    private readonly reportDefinitionService: ReportDefinitionService,
    private readonly reportRunnerService: ReportRunnerService,
  ) {}

  @Get()
  @RequireAnalyticsAccess({ category: 'admin', action: 'view_dashboard' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List revenue report definitions visible to admins' })
  async listReports(@CurrentAnalyticsActor() actor: AnalyticsActor) {
    return this.reportDefinitionService.listVisibleToRole(actor.role);
  }

  @Post(':reportKey/run')
  @RequireAnalyticsAccess({ category: 'admin', action: 'run_report' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run a revenue report from safe billing aggregates' })
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
  @RequireAnalyticsAccess({ category: 'admin', action: 'view_dashboard' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the status/result reference of a revenue report run' })
  async getRunStatus(@Param('runId') runId: string) {
    return this.reportRunnerService.getRunStatus(runId);
  }
}
