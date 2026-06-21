import { ForbiddenException } from '@nestjs/common';

import { AnalyticsExportController } from './analytics-export.controller';
import { AnalyticsExportService } from './analytics-export.service';
import { ExportJob } from './analytics.entities';

describe('AnalyticsExportController', () => {
  let analyticsExportService: jest.Mocked<Pick<AnalyticsExportService, 'requestExport' | 'getExportStatus'>>;
  let controller: AnalyticsExportController;

  beforeEach(() => {
    analyticsExportService = { requestExport: jest.fn(), getExportStatus: jest.fn() };
    controller = new AnalyticsExportController(analyticsExportService as unknown as AnalyticsExportService);
  });

  it('passes the resolved actor (never a client-supplied identity) as requestedByUserId/requestedRole', async () => {
    analyticsExportService.requestExport.mockResolvedValue({ id: 'export-1' } as ExportJob);

    await controller.requestExport(
      { reportRunId: 'run-1', exportType: 'csv' },
      { userId: 'user-1', role: 'admin' },
    );

    expect(analyticsExportService.requestExport).toHaveBeenCalledWith({
      requestedByUserId: 'user-1',
      requestedRole: 'admin',
      reportRunId: 'run-1',
      exportType: 'csv',
    });
  });

  it('returns the export job when the caller owns it', async () => {
    analyticsExportService.getExportStatus.mockResolvedValue({
      id: 'export-1',
      requestedByUserId: 'user-1',
    } as ExportJob);

    const result = await controller.getExportStatus('export-1', { userId: 'user-1', role: 'admin' });

    expect(result.id).toBe('export-1');
  });

  it('rejects with 403 when the export job was requested by a different user', async () => {
    analyticsExportService.getExportStatus.mockResolvedValue({
      id: 'export-1',
      requestedByUserId: 'someone-else',
    } as ExportJob);

    await expect(
      controller.getExportStatus('export-1', { userId: 'user-1', role: 'admin' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
