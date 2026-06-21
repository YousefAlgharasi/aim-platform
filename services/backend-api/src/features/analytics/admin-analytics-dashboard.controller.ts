import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AnalyticsAccessGuard } from './analytics-access.guard';
import { RequireAnalyticsAccess } from './analytics-access.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardKey } from './analytics.entities';

/**
 * Backend-approved admin dashboard reads only. The frontend never assembles
 * dashboard widgets from raw metric/report data — it only renders what
 * DashboardService resolves here.
 */
@ApiTags('Admin Analytics')
@Controller('admin/analytics/dashboard')
@UseGuards(SupabaseJwtAuthGuard, AnalyticsAccessGuard)
export class AdminAnalyticsDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(':dashboardKey')
  @RequireAnalyticsAccess({ category: 'admin', action: 'view_dashboard' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a resolved admin analytics dashboard (admin only)' })
  async getDashboard(@Param('dashboardKey') dashboardKey: DashboardKey) {
    return this.dashboardService.getDashboard(dashboardKey);
  }
}
