import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AnalyticsAccessGuard } from './analytics-access.guard';
import { RequireAnalyticsAccess } from './analytics-access.decorator';
import { CurrentAnalyticsActor, AnalyticsActor } from './current-analytics-actor.decorator';
import { AnalyticsExportService } from './analytics-export.service';
import { RequestExportDto } from './analytics.dtos';

/**
 * Protected export creation/status endpoints. AnalyticsExportService is
 * the sole authority for export scope, ownership verification, and file
 * generation — this controller never assembles export content or accepts
 * a client-supplied scope/ownership claim, only a target reportRunId.
 */
@ApiTags('Analytics Exports')
@Controller('analytics/exports')
@UseGuards(SupabaseJwtAuthGuard, AnalyticsAccessGuard)
export class AnalyticsExportController {
  constructor(private readonly analyticsExportService: AnalyticsExportService) {}

  @Post()
  @RequireAnalyticsAccess({ category: 'admin', action: 'request_export' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request an export of a completed report run owned by the requester' })
  async requestExport(
    @Body() body: RequestExportDto,
    @CurrentAnalyticsActor() actor: AnalyticsActor,
  ) {
    return this.analyticsExportService.requestExport({
      requestedByUserId: actor.userId,
      requestedRole: actor.role,
      reportRunId: body.reportRunId as string,
      exportType: body.exportType,
    });
  }

  @Get(':exportJobId')
  @RequireAnalyticsAccess({ category: 'admin', action: 'request_export' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the status and file reference (download metadata) of an export job' })
  async getExportStatus(
    @Param('exportJobId') exportJobId: string,
    @CurrentAnalyticsActor() actor: AnalyticsActor,
  ) {
    const job = await this.analyticsExportService.getExportStatus(exportJobId);

    if (job.requestedByUserId !== actor.userId) {
      throw new ForbiddenException('You may only view export jobs you requested');
    }

    return job;
  }
}
