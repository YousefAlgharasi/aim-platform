import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { AnalyticsExportService } from './analytics-export.service';
import { AnalyticsRepository } from './analytics.repository';
import { ExportJob, ReportRun } from './analytics.entities';

function makeReportRun(overrides: Partial<ReportRun> = {}): ReportRun {
  return {
    id: 'run-1',
    reportDefinitionId: 'def-1',
    requestedByUserId: 'user-1',
    requestedRole: 'admin',
    parameters: {},
    status: 'completed',
    resultRef: 'report-run:run-1',
    errorMessage: null,
    startedAt: new Date(),
    completedAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  };
}

function makeExportJob(overrides: Partial<ExportJob> = {}): ExportJob {
  return {
    id: 'export-1',
    requestedByUserId: 'user-1',
    requestedRole: 'admin',
    reportRunId: 'run-1',
    exportType: 'csv',
    scope: { reportRunId: 'run-1' },
    status: 'queued',
    fileRef: null,
    denialReason: null,
    createdAt: new Date(),
    completedAt: null,
    ...overrides,
  };
}

describe('AnalyticsExportService', () => {
  let analyticsRepository: jest.Mocked<
    Pick<
      AnalyticsRepository,
      | 'findReportRunById'
      | 'createExportJob'
      | 'updateExportJobStatus'
      | 'findExportJobById'
      | 'insertAccessAuditLog'
    >
  >;
  let service: AnalyticsExportService;

  beforeEach(() => {
    analyticsRepository = {
      findReportRunById: jest.fn(),
      createExportJob: jest.fn(),
      updateExportJobStatus: jest.fn(),
      findExportJobById: jest.fn(),
      insertAccessAuditLog: jest.fn().mockResolvedValue(undefined),
    };
    service = new AnalyticsExportService(analyticsRepository as unknown as AnalyticsRepository);
  });

  describe('requestExport — format validation', () => {
    it('rejects an unsupported export type before touching the report run', async () => {
      await expect(
        service.requestExport({
          requestedByUserId: 'user-1',
          requestedRole: 'admin',
          reportRunId: 'run-1',
          exportType: 'xlsx',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(analyticsRepository.findReportRunById).not.toHaveBeenCalled();
    });
  });

  describe('requestExport — scope/ownership', () => {
    it('rejects exporting a report run the requester did not request, and audits the denial', async () => {
      analyticsRepository.findReportRunById.mockResolvedValue(
        makeReportRun({ requestedByUserId: 'someone-else' }),
      );

      await expect(
        service.requestExport({
          requestedByUserId: 'user-1',
          requestedRole: 'admin',
          reportRunId: 'run-1',
          exportType: 'csv',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(analyticsRepository.createExportJob).not.toHaveBeenCalled();
      expect(analyticsRepository.insertAccessAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId: 'user-1',
          action: 'request_export',
          targetType: 'report_run',
          targetId: 'run-1',
          result: 'denied',
        }),
      );
    });

    it('throws not found for an unknown report run id', async () => {
      analyticsRepository.findReportRunById.mockResolvedValue(null);

      await expect(
        service.requestExport({
          requestedByUserId: 'user-1',
          requestedRole: 'admin',
          reportRunId: 'missing-run',
          exportType: 'csv',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('requestExport — report run state', () => {
    it('denies (but still records) an export of a report run that has not completed', async () => {
      analyticsRepository.findReportRunById.mockResolvedValue(
        makeReportRun({ status: 'running', requestedByUserId: 'user-1' }),
      );
      analyticsRepository.createExportJob.mockResolvedValue(makeExportJob({ status: 'queued' }));
      analyticsRepository.updateExportJobStatus.mockResolvedValue(
        makeExportJob({ status: 'denied', denialReason: 'Report run has not completed' }),
      );

      const result = await service.requestExport({
        requestedByUserId: 'user-1',
        requestedRole: 'admin',
        reportRunId: 'run-1',
        exportType: 'csv',
      });

      expect(result.status).toBe('denied');
      expect(result.denialReason).toBe('Report run has not completed');
      expect(analyticsRepository.insertAccessAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'request_export', result: 'denied' }),
      );
    });

    it('denies an export of a failed report run', async () => {
      analyticsRepository.findReportRunById.mockResolvedValue(
        makeReportRun({ status: 'failed', requestedByUserId: 'user-1' }),
      );
      analyticsRepository.createExportJob.mockResolvedValue(makeExportJob({ status: 'queued' }));
      analyticsRepository.updateExportJobStatus.mockResolvedValue(
        makeExportJob({ status: 'denied', denialReason: 'Report run has not completed' }),
      );

      const result = await service.requestExport({
        requestedByUserId: 'user-1',
        requestedRole: 'admin',
        reportRunId: 'run-1',
        exportType: 'json',
      });

      expect(result.status).toBe('denied');
    });
  });

  describe('requestExport — success path and scope content', () => {
    it('generates the export from the report run result only, never from request-time input, and audits the allow', async () => {
      analyticsRepository.findReportRunById.mockResolvedValue(
        makeReportRun({ status: 'completed', requestedByUserId: 'user-1' }),
      );
      analyticsRepository.createExportJob.mockResolvedValue(makeExportJob({ status: 'queued' }));
      analyticsRepository.updateExportJobStatus.mockResolvedValue(
        makeExportJob({ status: 'completed', fileRef: 'export-job:export-1' }),
      );

      const result = await service.requestExport({
        requestedByUserId: 'user-1',
        requestedRole: 'admin',
        reportRunId: 'run-1',
        exportType: 'pdf',
      });

      expect(analyticsRepository.createExportJob).toHaveBeenCalledWith(
        expect.objectContaining({
          requestedByUserId: 'user-1',
          reportRunId: 'run-1',
          exportType: 'pdf',
          scope: { reportRunId: 'run-1' },
        }),
      );
      expect(analyticsRepository.insertAccessAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'request_export', result: 'allowed' }),
      );
      expect(result.status).toBe('completed');
      expect(result.fileRef).toBe('export-job:export-1');
    });

    it('marks the export job failed if generation throws, recording a denial reason instead of partial content', async () => {
      analyticsRepository.findReportRunById.mockResolvedValue(
        makeReportRun({ status: 'completed', requestedByUserId: 'user-1' }),
      );
      analyticsRepository.createExportJob.mockResolvedValue(makeExportJob({ status: 'queued' }));
      analyticsRepository.updateExportJobStatus
        .mockImplementationOnce(() => {
          throw new Error('storage unavailable');
        })
        .mockResolvedValueOnce(
          makeExportJob({ status: 'failed', denialReason: 'storage unavailable' }),
        );

      const result = await service.requestExport({
        requestedByUserId: 'user-1',
        requestedRole: 'admin',
        reportRunId: 'run-1',
        exportType: 'csv',
      });

      expect(result.status).toBe('failed');
      expect(result.denialReason).toBe('storage unavailable');
    });
  });

  describe('getExportStatus', () => {
    it('returns the export job when found, exposing only status/fileRef/denialReason metadata', async () => {
      analyticsRepository.findExportJobById.mockResolvedValue(
        makeExportJob({ status: 'completed', fileRef: 'export-job:export-1' }),
      );

      const result = await service.getExportStatus('export-1');

      expect(result.fileRef).toBe('export-job:export-1');
      expect(result).not.toHaveProperty('rawPayload');
    });

    it('throws not found for an unknown export job id', async () => {
      analyticsRepository.findExportJobById.mockResolvedValue(null);

      await expect(service.getExportStatus('missing-export')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
