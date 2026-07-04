import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { ReportRunnerService } from './report-runner.service';
import { ReportDefinitionService } from './report-definition.service';
import { MetricDefinitionService } from './metric-definition.service';
import { StudentAimProgressReportService } from './student-aim-progress-report.service';
import { AnalyticsRepository } from './analytics.repository';
import { ReportDefinition, ReportRun, MetricDefinition } from './analytics.entities';

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
    resultData: null,
    errorMessage: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeMetricDefinition(overrides: Partial<MetricDefinition> = {}): MetricDefinition {
  return {
    id: 'metric-1',
    key: 'daily_active_students',
    name: 'Daily Active Students',
    description: null,
    domain: 'learning',
    valueType: 'distinct_count',
    aggregationMethod: 'distinct_count',
    sourceEventTypes: ['session.started', 'lesson.started'],
    isActive: true,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ReportRunnerService', () => {
  let analyticsRepository: jest.Mocked<
    Pick<
      AnalyticsRepository,
      | 'createReportRun'
      | 'findReportRunById'
      | 'updateReportRunStatus'
      | 'findMetricAggregates'
      | 'findLatestMetricAggregate'
      | 'findEventsByType'
    >
  >;
  let reportDefinitionService: jest.Mocked<Pick<ReportDefinitionService, 'getByKeyForRole'>>;
  let metricDefinitionService: jest.Mocked<Pick<MetricDefinitionService, 'getByKey'>>;
  let studentAimProgressReportService: jest.Mocked<Pick<StudentAimProgressReportService, 'buildSections'>>;
  let service: ReportRunnerService;

  beforeEach(() => {
    analyticsRepository = {
      createReportRun: jest.fn(),
      findReportRunById: jest.fn(),
      updateReportRunStatus: jest.fn(),
      findMetricAggregates: jest.fn().mockResolvedValue([]),
      findLatestMetricAggregate: jest.fn().mockResolvedValue(null),
      findEventsByType: jest.fn().mockResolvedValue([]),
    };
    reportDefinitionService = { getByKeyForRole: jest.fn() };
    metricDefinitionService = { getByKey: jest.fn() };
    studentAimProgressReportService = { buildSections: jest.fn().mockResolvedValue([]) };

    service = new ReportRunnerService(
      analyticsRepository as unknown as AnalyticsRepository,
      reportDefinitionService as unknown as ReportDefinitionService,
      metricDefinitionService as unknown as MetricDefinitionService,
      studentAimProgressReportService as unknown as StudentAimProgressReportService,
    );
  });

  describe('runReport', () => {
    it('resolves the report definition scoped to the requester role before creating a run', async () => {
      const definition = makeDefinition();
      reportDefinitionService.getByKeyForRole.mockResolvedValue(definition);
      metricDefinitionService.getByKey.mockResolvedValue(makeMetricDefinition());
      analyticsRepository.createReportRun.mockResolvedValue(makeRun({ status: 'queued' }));
      analyticsRepository.updateReportRunStatus
        .mockResolvedValueOnce(makeRun({ status: 'running' }))
        .mockResolvedValueOnce(
          makeRun({
            status: 'completed',
            resultRef: 'report-run:run-1',
            resultData: {
              reportKey: 'learning-progress',
              reportName: 'Learning progress',
              category: 'learning',
              generatedAt: new Date().toISOString(),
              parameters: { from: '2026-01-01', to: '2026-01-31' },
              sections: [],
            },
          }),
        );

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
      expect(result.resultData).not.toBeNull();
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
      const definition = makeDefinition();
      reportDefinitionService.getByKeyForRole.mockResolvedValue(definition);
      metricDefinitionService.getByKey.mockResolvedValue(makeMetricDefinition());
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
      const definition = makeDefinition();
      reportDefinitionService.getByKeyForRole.mockResolvedValue(definition);
      metricDefinitionService.getByKey.mockRejectedValue(new Error('downstream failure'));
      analyticsRepository.createReportRun.mockResolvedValue(makeRun());

      analyticsRepository.updateReportRunStatus
        .mockResolvedValueOnce(makeRun({ status: 'running' }))
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

    it('assembles resultData with metrics and events sections from backend-owned data sources', async () => {
      const definition = makeDefinition({ category: 'learning' });
      reportDefinitionService.getByKeyForRole.mockResolvedValue(definition);
      metricDefinitionService.getByKey.mockResolvedValue(makeMetricDefinition());
      analyticsRepository.findMetricAggregates.mockResolvedValue([
        {
          id: 'agg-1',
          metricDefinitionId: 'metric-1',
          scopeType: 'platform',
          scopeId: null,
          periodType: 'day',
          periodStart: new Date('2026-01-01'),
          periodEnd: new Date('2026-01-02'),
          value: 42,
          computedAt: new Date(),
        },
      ]);
      analyticsRepository.findLatestMetricAggregate.mockResolvedValue({
        id: 'agg-1',
        metricDefinitionId: 'metric-1',
        scopeType: 'platform',
        scopeId: null,
        periodType: 'day',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-01-02'),
        value: 42,
        computedAt: new Date(),
      });
      analyticsRepository.findEventsByType.mockResolvedValue([
        {
          id: 'evt-1',
          eventType: 'session.started',
          actorRole: 'student',
          actorId: 'student-1',
          subjectType: 'session',
          subjectId: 'sess-1',
          occurredAt: new Date('2026-01-01T10:00:00Z'),
          metadata: {},
          createdAt: new Date(),
        },
      ]);
      analyticsRepository.createReportRun.mockResolvedValue(makeRun());

      let capturedResultData: unknown = null;
      analyticsRepository.updateReportRunStatus.mockImplementation(async (_id, data) => {
        if (data.resultData) capturedResultData = data.resultData;
        return makeRun({
          status: data.status,
          resultData: data.resultData ?? null,
          resultRef: data.resultRef ?? null,
        });
      });

      await service.runReport({
        reportKey: 'learning-progress',
        requestedByUserId: 'user-1',
        requestedRole: 'admin',
        parameters: { from: '2026-01-01', to: '2026-01-31' },
      });

      expect(capturedResultData).not.toBeNull();
      const resultData = capturedResultData as {
        reportKey: string;
        reportName: string;
        category: string;
        sections: { title: string; type: string; data: unknown[] }[];
      };
      expect(resultData.reportKey).toBe('learning-progress');
      expect(resultData.reportName).toBe('Learning progress');
      expect(resultData.category).toBe('learning');
      expect(resultData.sections.length).toBeGreaterThan(0);

      const metricsSection = resultData.sections.find((s) => s.type === 'metrics');
      expect(metricsSection).toBeDefined();
      expect(metricsSection!.data.length).toBeGreaterThan(0);
    });

    it('dispatches student_aim_progress to StudentAimProgressReportService, scoped to requestedByUserId, bypassing the generic metric mechanism (P20-023)', async () => {
      const definition = makeDefinition({
        key: 'student_aim_progress',
        category: 'student',
        allowedRoles: ['student'],
      });
      reportDefinitionService.getByKeyForRole.mockResolvedValue(definition);
      analyticsRepository.createReportRun.mockResolvedValue(makeRun({ status: 'queued' }));

      let capturedResultData: unknown;
      analyticsRepository.updateReportRunStatus.mockImplementation(async (_id, update) => {
        if (update.status === 'completed') {
          capturedResultData = update.resultData;
        }
        return makeRun({ status: update.status, resultData: update.resultData ?? null });
      });

      const aimSections = [{ title: 'Skill Mastery', type: 'table' as const, data: [{ skillId: 'skill:a' }] }];
      (studentAimProgressReportService.buildSections as jest.Mock).mockResolvedValue(aimSections);

      await service.runReport({
        reportKey: 'student_aim_progress',
        requestedByUserId: 'student-42',
        requestedRole: 'student',
        parameters: {},
      });

      expect(studentAimProgressReportService.buildSections).toHaveBeenCalledWith('student-42');
      expect(metricDefinitionService.getByKey).not.toHaveBeenCalled();
      const resultData = capturedResultData as { sections: unknown[] };
      expect(resultData.sections).toEqual(aimSections);
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
