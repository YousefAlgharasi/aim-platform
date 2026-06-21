import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AnalyticsAccessGuard } from './analytics-access.guard';
import { RequireAnalyticsAccess } from './analytics-access.decorator';
import { CurrentAnalyticsActor, AnalyticsActor } from './current-analytics-actor.decorator';
import { ReportDefinitionService } from './report-definition.service';

/**
 * Backend-approved student-facing analytics summary. Returns only the
 * report definitions visible to the student role; the student never
 * computes their own progress/mastery figures — those are produced
 * elsewhere by backend-owned services and surfaced via ReportRunnerService
 * report runs, never assembled client-side.
 */
@ApiTags('Student Analytics')
@Controller('student/analytics/summary')
@UseGuards(SupabaseJwtAuthGuard, AnalyticsAccessGuard)
export class StudentAnalyticsSummaryController {
  constructor(private readonly reportDefinitionService: ReportDefinitionService) {}

  @Get()
  @RequireAnalyticsAccess({ category: 'student', action: 'view_dashboard' })
  @ApiBearerAuth()
  @ApiOperation({ summary: "List backend-approved analytics summary reports visible to the authenticated student" })
  async getSummary(@CurrentAnalyticsActor() actor: AnalyticsActor) {
    return this.reportDefinitionService.listVisibleToRole(actor.role);
  }
}
