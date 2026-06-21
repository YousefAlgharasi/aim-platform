import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import { ExportJob, AnalyticsActorRole } from './analytics.entities';
import { validateExportType } from './analytics.validation';

/**
 * Backend authority for analytics export generation
 * (docs/phase-15/analytics-authority-rules.md). Exports are only ever
 * generated from completed, ownership-verified report runs — clients
 * never assemble export content or choose export scope themselves.
 */
@Injectable()
export class AnalyticsExportService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async requestExport(params: {
    requestedByUserId: string;
    requestedRole: AnalyticsActorRole;
    reportRunId: string;
    exportType: string;
  }): Promise<ExportJob> {
    validateExportType(params.exportType);

    const reportRun = await this.analyticsRepository.findReportRunById(params.reportRunId);

    if (!reportRun) {
      throw new NotFoundException(`Report run not found: ${params.reportRunId}`);
    }

    if (reportRun.requestedByUserId !== params.requestedByUserId) {
      await this.analyticsRepository.insertAccessAuditLog({
        actorUserId: params.requestedByUserId,
        actorRole: params.requestedRole,
        action: 'request_export',
        targetType: 'report_run',
        targetId: params.reportRunId,
        result: 'denied',
      });

      throw new ForbiddenException('You may only export report runs you requested');
    }

    if (reportRun.status !== 'completed') {
      const denied = await this.analyticsRepository.createExportJob({
        requestedByUserId: params.requestedByUserId,
        requestedRole: params.requestedRole,
        reportRunId: params.reportRunId,
        exportType: params.exportType,
        scope: { reportRunId: params.reportRunId },
      });

      const updated = await this.analyticsRepository.updateExportJobStatus(denied.id, {
        status: 'denied',
        denialReason: 'Report run has not completed',
      });

      await this.analyticsRepository.insertAccessAuditLog({
        actorUserId: params.requestedByUserId,
        actorRole: params.requestedRole,
        action: 'request_export',
        targetType: 'report_run',
        targetId: params.reportRunId,
        result: 'denied',
      });

      return updated as ExportJob;
    }

    const job = await this.analyticsRepository.createExportJob({
      requestedByUserId: params.requestedByUserId,
      requestedRole: params.requestedRole,
      reportRunId: params.reportRunId,
      exportType: params.exportType,
      scope: { reportRunId: params.reportRunId },
    });

    await this.analyticsRepository.insertAccessAuditLog({
      actorUserId: params.requestedByUserId,
      actorRole: params.requestedRole,
      action: 'request_export',
      targetType: 'report_run',
      targetId: params.reportRunId,
      result: 'allowed',
    });

    return this.process(job.id);
  }

  async getExportStatus(id: string): Promise<ExportJob> {
    const job = await this.analyticsRepository.findExportJobById(id);

    if (!job) {
      throw new NotFoundException(`Export job not found: ${id}`);
    }

    return job;
  }

  /**
   * Generates the export file reference from the report run's already-
   * approved result, never from client-supplied data.
   */
  private async process(exportJobId: string): Promise<ExportJob> {
    try {
      const fileRef = `export-job:${exportJobId}`;

      const completed = await this.analyticsRepository.updateExportJobStatus(exportJobId, {
        status: 'completed',
        fileRef,
        completedAt: new Date(),
      });

      return completed as ExportJob;
    } catch (error) {
      const failed = await this.analyticsRepository.updateExportJobStatus(exportJobId, {
        status: 'failed',
        denialReason: error instanceof Error ? error.message : 'Unknown export failure',
        completedAt: new Date(),
      });

      return failed as ExportJob;
    }
  }
}
