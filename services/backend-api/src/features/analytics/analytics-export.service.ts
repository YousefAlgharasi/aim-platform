import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import {
  ExportJob,
  AnalyticsActorRole,
  ReportRunResultData,
  ReportSection,
} from './analytics.entities';
import { validateExportType } from './analytics.validation';

@Injectable()
export class AnalyticsExportService {
  private readonly logger = new Logger(AnalyticsExportService.name);

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

    return this.process(job.id, reportRun.resultData, params.exportType);
  }

  async getExportStatus(id: string): Promise<ExportJob> {
    const job = await this.analyticsRepository.findExportJobById(id);

    if (!job) {
      throw new NotFoundException(`Export job not found: ${id}`);
    }

    return job;
  }

  private async process(
    exportJobId: string,
    resultData: ReportRunResultData | null,
    exportType: string,
  ): Promise<ExportJob> {
    try {
      const content = this.generateExportContent(resultData, exportType);
      const fileRef = `export-job:${exportJobId}:${exportType}`;

      const completed = await this.analyticsRepository.updateExportJobStatus(exportJobId, {
        status: 'completed',
        fileRef,
        completedAt: new Date(),
      });

      this.logger.log(`Export job ${exportJobId} completed (${exportType}, ${content.length} bytes)`);
      return completed as ExportJob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown export failure';
      this.logger.warn(`Export job ${exportJobId} failed: ${errorMessage}`);

      const failed = await this.analyticsRepository.updateExportJobStatus(exportJobId, {
        status: 'failed',
        denialReason: errorMessage,
        completedAt: new Date(),
      });

      return failed as ExportJob;
    }
  }

  private generateExportContent(
    resultData: ReportRunResultData | null,
    exportType: string,
  ): string {
    if (!resultData) {
      return exportType === 'json' ? '{"sections":[]}' : '';
    }

    switch (exportType) {
      case 'json':
        return JSON.stringify(resultData, null, 2);
      case 'csv':
        return this.generateCsvContent(resultData);
      case 'pdf':
        return this.generatePdfPlaceholder(resultData);
      default:
        return JSON.stringify(resultData);
    }
  }

  private generateCsvContent(resultData: ReportRunResultData): string {
    const lines: string[] = [];

    lines.push(`Report: ${this.escapeCsv(resultData.reportName)}`);
    lines.push(`Category: ${this.escapeCsv(resultData.category)}`);
    lines.push(`Generated: ${resultData.generatedAt}`);
    lines.push('');

    for (const section of resultData.sections) {
      lines.push(`--- ${this.escapeCsv(section.title)} ---`);

      if (section.data.length === 0) continue;

      const headers = Object.keys(section.data[0]);
      lines.push(headers.map((h) => this.escapeCsv(String(h))).join(','));

      for (const row of section.data) {
        const values = headers.map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return this.escapeCsv(JSON.stringify(val));
          return this.escapeCsv(String(val));
        });
        lines.push(values.join(','));
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private generatePdfPlaceholder(resultData: ReportRunResultData): string {
    const summary = {
      format: 'pdf-pending',
      reportName: resultData.reportName,
      category: resultData.category,
      generatedAt: resultData.generatedAt,
      sectionCount: resultData.sections.length,
      totalDataPoints: resultData.sections.reduce(
        (sum: number, s: ReportSection) => sum + s.data.length,
        0,
      ),
    };
    return JSON.stringify(summary);
  }
}
