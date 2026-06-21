import { ForbiddenException } from '@nestjs/common';

import { ParentReportsController } from './parent-reports.controller';
import { ReportDefinitionService } from './report-definition.service';
import { ReportRunnerService } from './report-runner.service';
import { ReportDefinition, ReportRun } from './analytics.entities';

function makeRun(overrides: Partial<ReportRun> = {}): ReportRun {
  return {
    id: 'run-1',
    reportDefinitionId: 'def-1',
    requestedByUserId: 'parent-1',
    requestedRole: 'parent',
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

describe('ParentReportsController', () => {
  let reportDefinitionService: jest.Mocked<Pick<ReportDefinitionService, 'listVisibleToRole'>>;
  let reportRunnerService: jest.Mocked<Pick<ReportRunnerService, 'runReport' | 'getRunStatus'>>;
  let controller: ParentReportsController;

  beforeEach(() => {
    reportDefinitionService = { listVisibleToRole: jest.fn() };
    reportRunnerService = { runReport: jest.fn(), getRunStatus: jest.fn() };
    controller = new ParentReportsController(
      reportDefinitionService as unknown as ReportDefinitionService,
      reportRunnerService as unknown as ReportRunnerService,
    );
  });

  describe('listReports', () => {
    it('only lists report definitions visible to the authenticated parent role', async () => {
      reportDefinitionService.listVisibleToRole.mockResolvedValue([{ key: 'progress' } as ReportDefinition]);

      await controller.listReports({ userId: 'parent-1', role: 'parent' });

      expect(reportDefinitionService.listVisibleToRole).toHaveBeenCalledWith('parent');
    });
  });

  describe('runReport', () => {
    it('forwards the resolved actor (never a client-supplied identity) as the requester', async () => {
      reportRunnerService.runReport.mockResolvedValue(makeRun());

      await controller.runReport('progress', { parameters: { childId: 'child-1' } }, {
        userId: 'parent-1',
        role: 'parent',
      });

      expect(reportRunnerService.runReport).toHaveBeenCalledWith({
        reportKey: 'progress',
        requestedByUserId: 'parent-1',
        requestedRole: 'parent',
        parameters: { childId: 'child-1' },
      });
    });
  });

  describe('getRunStatus', () => {
    it('returns the run when the caller is the parent who requested it', async () => {
      reportRunnerService.getRunStatus.mockResolvedValue(makeRun({ requestedByUserId: 'parent-1' }));

      const result = await controller.getRunStatus('run-1', { userId: 'parent-1', role: 'parent' });

      expect(result.id).toBe('run-1');
    });

    it('rejects with 403 when a different parent requested the run (cross-user report leak)', async () => {
      reportRunnerService.getRunStatus.mockResolvedValue(makeRun({ requestedByUserId: 'parent-2' }));

      await expect(
        controller.getRunStatus('run-1', { userId: 'parent-1', role: 'parent' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
