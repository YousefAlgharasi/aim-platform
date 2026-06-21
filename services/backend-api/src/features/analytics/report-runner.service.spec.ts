import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { ReportRunnerService } from './report-runner.service';
import { ReportDefinitionService } from './report-definition.service';
import { AnalyticsRepository } from './analytics.repository';
import { ReportDefinition, ReportRun } from './analytics.entities';

function makeDefinition(overrides: Partial<ReportDefinition> = {}): ReportDefinition {
  return {
    id: 'def-1',
    key: 'learning-progress',
    name: 'Learning progress',
    description: null,
    category: 'learning',
    allowedRoles: ['admin', 'parent', 'student'],
    parametersSchema: {},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRun(overrides: Partial<ReportRun> = {}): ReportRun {
  return {
    id: 'run-1',
    reportDefinitionId: 'def-1',
    requestedByUserId: 'user-1',
    requestedRole: 'admin',
    parameters: {},
    status: 'queued',
    resultRef: null,
    errorMessage: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('ReportRunnerService', () => {
  let analyticsRepository: jest.Mocked<
    Pick<AnalyticsRepository, 'createReportRun' | 'findReportRunById' | 'updateReportRunStatus'>
  >;
  let reportDefinitionService: jest.Mocked<Pick<ReportDefinitionService, 'getByKeyForRole'>>;
  let service: ReportRunnerService;

  beforeEach(() => {
    analyticsRepository = {
      createReportRun: jest.fn(),
      findReportRunById: jest.fn(),
      updateReportRunStatus: jest.fn(),
    };
    reportDefinitionService = { getByKeyForRole: jest.fn() };

    service = new ReportRunnerService(
      analyticsRepository as unknown as AnalyticsRepository,
      reportDefinitionService as unknown as ReportDefinitionService,
    );
  });

  describe('runReport', () => {
    it('resolves the report definition scoped to the requester role before creating a run', async () => {
      reportDefinitionService.getByKeyForRole.mockResolvedValue(makeDefinition());
      analyticsRepository.createReportRun.mockResolvedValue(makeRun({ status: 'queued' }));
      analyticsRepository.updateReportRunStatus
        .mockResolvedValueOnce(makeRun({ status: 'running' }))
        .mockResolvedValueOnce(makeRun({ status: 'completed', resultRef: 'report-run:run-1' }));

      const result = await service.runReport({
        reportKey: 'learning-progress',
        requestedByUserId: 'user-1',
        requestedRole: 'admin',
        parameters: { from: '2026-01-01', to: '2026-01-31' },
      });

      expect(reportDefinitionService.getByKeyForRole).toHaveBeenCalledWith('learning-progress', 'admin');
      expect(analyticsRepository.createReportRun).toHaveBeenCalledWith(
        expect.objectContaining({
          reportDefinitionId: 'def-1',
          requestedByUserId: 'user-1',
          requestedRole: 'admin',
          parameters: { from: '2026-01-01', to: '2026-01-31' },
        }),
      );
      expect(result.status).toBe('completed');
      expect(result.resultRef).toBe('report-run:run-1');
    });

    it('propagates a not-found error for an unknown report key without creating a run', async () => {
      reportDefinitionService.getByKeyForRole.mockRejectedValue(
        new NotFoundException('Report definition not found: missing-report'),
      );

      await expect(
        service.runReport({
          reportKey: 'missing-report',
          requestedByUserId: 'user-1',
          requestedRole: 'admin',
          parameters: {},
        }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(analyticsRepository.createReportRun).not.toHaveBeenCalled();
    });

    it('propagates a visibility/role error when the role cannot access the report definition', async () => {
      reportDefinitionService.getByKeyForRole.mockRejectedValue(
        new ForbiddenException('Role student is not permitted to access this resource'),
      );

      await expect(
        service.runReport({
          reportKey: 'admin-only-report',
          requestedByUserId: 'user-1',
          requestedRole: 'student',
          parameters: {},
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(analyticsRepository.createReportRun).not.toHaveBeenCalled();
    });

    it('runs successfully with no parameters supplied (empty filter set)', async () => {
      reportDefinitionService.getByKeyForRole.mockResolvedValue(makeDefinition());
      analyticsRepository.createReportRun.mockResolvedValue(makeRun());
      analyticsRepository.updateReportRunStatus
        .mockResolvedValueOnce(makeRun({ status: 'running' }))
        .mockResolvedValueOnce(makeRun({ status: 'completed', resultRef: 'report-run:run-1' }));

      const result = await service.runReport({
        reportKey: 'learning-progress',
        requestedByUserId: 'user-1',
        requestedRole: 'admin',
        parameters: {},
      });

      expect(analyticsRepository.createReportRun).toHaveBeenCalledWith(
        expect.objectContaining({ parameters: {} }),
      );
      expect(result.status).toBe('completed');
    });

    it('marks the run failed when execution throws, recording the error message', async () => {
      reportDefinitionService.getByKeyForRole.mockResolvedValue(makeDefinition());
      analyticsRepository.createReportRun.mockResolvedValue(makeRun());

      // First updateReportRunStatus call (to "running") succeeds; the
      // second call (to "completed") throws inside execute(), which must
      // be caught and turned into a "failed" status update.
      analyticsRepository.updateReportRunStatus
        .mockResolvedValueOnce(makeRun({ status: 'running' }))
        .mockImplementationOnce(() => {
          throw new Error('downstream failure');
        })
        .mockResolvedValueOnce(makeRun({ status: 'failed', errorMessage: 'downstream failure' }));

      const result = await service.runReport({
        reportKey: 'learning-progress',
        requestedByUserId: 'user-1',
        requestedRole: 'admin',
        parameters: {},
      });

      expect(result.status).toBe('failed');
      expect(result.errorMessage).toBe('downstream failure');
    });
  });

  describe('getRunStatus', () => {
    it('returns the run when found', async () => {
      analyticsRepository.findReportRunById.mockResolvedValue(makeRun({ status: 'completed' }));

      const result = await service.getRunStatus('run-1');

      expect(result.status).toBe('completed');
    });

    it('throws not found for an unknown run id', async () => {
      analyticsRepository.findReportRunById.mockResolvedValue(null);

      await expect(service.getRunStatus('missing-run')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
