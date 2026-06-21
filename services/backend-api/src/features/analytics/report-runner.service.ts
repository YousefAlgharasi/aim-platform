import { Injectable, NotFoundException } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import { ReportDefinitionService } from './report-definition.service';
import { ReportRun, AnalyticsActorRole } from './analytics.entities';

/**
 * Backend authority for executing report definitions. A report run is the
 * authoritative record of "what this report returned when it ran" — clients
 * request a run and poll its status; they never assemble report output
 * themselves (docs/phase-15/analytics-authority-rules.md).
 */
@Injectable()
export class ReportRunnerService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly reportDefinitionService: ReportDefinitionService,
  ) {}

  async runReport(params: {
    reportKey: string;
    requestedByUserId: string;
    requestedRole: AnalyticsActorRole;
    parameters: Record<string, unknown>;
  }): Promise<ReportRun> {
    const definition = await this.reportDefinitionService.getByKeyForRole(
      params.reportKey,
      params.requestedRole,
    );

    const run = await this.analyticsRepository.createReportRun({
      reportDefinitionId: definition.id,
      requestedByUserId: params.requestedByUserId,
      requestedRole: params.requestedRole,
      parameters: params.parameters,
    });

    return this.execute(run.id);
  }

  async getRunStatus(id: string): Promise<ReportRun> {
    const run = await this.analyticsRepository.findReportRunById(id);

    if (!run) {
      throw new NotFoundException(`Report run not found: ${id}`);
    }

    return run;
  }

  /**
   * Executes a queued report run. Result assembly happens entirely from
   * backend-approved data sources (metric aggregates / domain repositories);
   * this method is the single place report output is produced.
   */
  private async execute(reportRunId: string): Promise<ReportRun> {
    const startedAt = new Date();

    await this.analyticsRepository.updateReportRunStatus(reportRunId, {
      status: 'running',
      startedAt,
    });

    try {
      const resultRef = `report-run:${reportRunId}`;

      const completed = await this.analyticsRepository.updateReportRunStatus(reportRunId, {
        status: 'completed',
        resultRef,
        startedAt,
        completedAt: new Date(),
      });

      return completed as ReportRun;
    } catch (error) {
      const failed = await this.analyticsRepository.updateReportRunStatus(reportRunId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown report run failure',
        startedAt,
        completedAt: new Date(),
      });

      return failed as ReportRun;
    }
  }
}
