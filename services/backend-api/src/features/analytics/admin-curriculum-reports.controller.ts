import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AnalyticsAccessGuard } from './analytics-access.guard';
import { RequireAnalyticsAccess } from './analytics-access.decorator';
import { CurrentAnalyticsActor, AnalyticsActor } from './current-analytics-actor.decorator';
import { ReportDefinitionService } from './report-definition.service';
import { ReportRunnerService } from './report-runner.service';
import { RunReportDto } from './analytics.dtos';

@ApiTags('Admin Analytics')
@Controller('admin/analytics/reports/curriculum')
@UseGuards(SupabaseJwtAuthGuard, AnalyticsAccessGuard)
export class AdminCurriculumReportsController {
  constructor(
    private readonly reportDefinitionService: ReportDefinitionService,
    private readonly reportRunnerService: ReportRunnerService,
  ) {}

  @Get()
  @RequireAnalyticsAccess({ category: 'curriculum', action: 'view_dashboard' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List curriculum report definitions visible to admins' })
  async listReports(@CurrentAnalyticsActor() actor: AnalyticsActor) {
    return this.reportDefinitionService.listVisibleToRole(actor.role);
  }

  @Post(':reportKey/run')
  @RequireAnalyticsAccess({ category: 'curriculum', action: 'run_report' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run a curriculum report (coverage, content usage)' })
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
  @RequireAnalyticsAccess({ category: 'curriculum', action: 'view_dashboard' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the status/result reference of a curriculum report run' })
  async getRunStatus(@Param('runId') runId: string) {
    return this.reportRunnerService.getRunStatus(runId);
  }
}
