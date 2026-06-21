import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { MetricAggregationService } from './metric-aggregation.service';
import { AnalyticsRepository } from './analytics.repository';
import { MetricDefinitionService } from './metric-definition.service';
import { MetricDefinition } from './analytics.entities';

function makeDefinition(overrides: Partial<MetricDefinition> = {}): MetricDefinition {
  return {
    id: 'metric-1',
    key: 'lessons_completed',
    name: 'Lessons completed',
    description: null,
    domain: 'learning',
    valueType: 'count',
    aggregationMethod: 'count',
    sourceEventTypes: ['lesson.completed'],
    isActive: true,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('MetricAggregationService', () => {
  let analyticsRepository: jest.Mocked<
    Pick<
      AnalyticsRepository,
      'countCohortMembers' | 'upsertMetricAggregate' | 'findMetricAggregates' | 'findEventsByType'
    >
  >;
  let metricDefinitionService: jest.Mocked<Pick<MetricDefinitionService, 'getByKey'>>;
  let service: MetricAggregationService;

  const periodStart = new Date('2026-01-01T00:00:00Z');
  const periodEnd = new Date('2026-01-08T00:00:00Z');

  beforeEach(() => {
    analyticsRepository = {
      countCohortMembers: jest.fn(),
      upsertMetricAggregate: jest.fn(),
      findMetricAggregates: jest.fn(),
      findEventsByType: jest.fn(),
    };
    metricDefinitionService = { getByKey: jest.fn() };

    service = new MetricAggregationService(
      analyticsRepository as unknown as AnalyticsRepository,
      metricDefinitionService as unknown as MetricDefinitionService,
    );
  });

  describe('computeAndStoreAggregate', () => {
    it('computes the value by counting only backend-recorded events for the source event types', async () => {
      metricDefinitionService.getByKey.mockResolvedValue(
        makeDefinition({ sourceEventTypes: ['lesson.completed', 'lesson.reviewed'] }),
      );
      analyticsRepository.findEventsByType.mockImplementation(async (eventType: string) =>
        eventType === 'lesson.completed' ? ([{}, {}, {}] as never) : ([{}] as never),
      );
      analyticsRepository.upsertMetricAggregate.mockResolvedValue({ value: 4 } as never);

      const result = await service.computeAndStoreAggregate({
        metricKey: 'lessons_completed',
        scopeType: 'platform',
        scopeId: null,
        periodType: 'week',
        periodStart,
        periodEnd,
      });

      expect(analyticsRepository.findEventsByType).toHaveBeenCalledWith('lesson.completed', periodStart, periodEnd);
      expect(analyticsRepository.findEventsByType).toHaveBeenCalledWith('lesson.reviewed', periodStart, periodEnd);
      expect(analyticsRepository.upsertMetricAggregate).toHaveBeenCalledWith(
        expect.objectContaining({ value: 4, metricDefinitionId: 'metric-1' }),
      );
      expect(result).toEqual({ value: 4 });
    });

    it('computes a zero value when the metric definition has no source event types', async () => {
      metricDefinitionService.getByKey.mockResolvedValue(makeDefinition({ sourceEventTypes: [] }));
      analyticsRepository.upsertMetricAggregate.mockResolvedValue({ value: 0 } as never);

      await service.computeAndStoreAggregate({
        metricKey: 'lessons_completed',
        scopeType: 'platform',
        scopeId: null,
        periodType: 'week',
        periodStart,
        periodEnd,
      });

      expect(analyticsRepository.findEventsByType).not.toHaveBeenCalled();
      expect(analyticsRepository.upsertMetricAggregate).toHaveBeenCalledWith(
        expect.objectContaining({ value: 0 }),
      );
    });

    it('rejects an invalid scope type before touching the repository', async () => {
      await expect(
        service.computeAndStoreAggregate({
          metricKey: 'lessons_completed',
          scopeType: 'invalid' as never,
          scopeId: null,
          periodType: 'week',
          periodStart,
          periodEnd,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(metricDefinitionService.getByKey).not.toHaveBeenCalled();
    });

    it('rejects an invalid period type', async () => {
      await expect(
        service.computeAndStoreAggregate({
          metricKey: 'lessons_completed',
          scopeType: 'platform',
          scopeId: null,
          periodType: 'invalid' as never,
          periodStart,
          periodEnd,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a period where end is not after start', async () => {
      await expect(
        service.computeAndStoreAggregate({
          metricKey: 'lessons_completed',
          scopeType: 'platform',
          scopeId: null,
          periodType: 'week',
          periodStart: periodEnd,
          periodEnd: periodStart,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('blocks a cohort aggregate when the cohort is below the minimum reportable size', async () => {
      analyticsRepository.countCohortMembers.mockResolvedValue(3);

      await expect(
        service.computeAndStoreAggregate({
          metricKey: 'lessons_completed',
          scopeType: 'cohort',
          scopeId: 'cohort-1',
          periodType: 'week',
          periodStart,
          periodEnd,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(metricDefinitionService.getByKey).not.toHaveBeenCalled();
    });

    it('allows a cohort aggregate at or above the minimum reportable size', async () => {
      analyticsRepository.countCohortMembers.mockResolvedValue(5);
      metricDefinitionService.getByKey.mockResolvedValue(makeDefinition());
      analyticsRepository.findEventsByType.mockResolvedValue([] as never);
      analyticsRepository.upsertMetricAggregate.mockResolvedValue({ value: 0 } as never);

      await expect(
        service.computeAndStoreAggregate({
          metricKey: 'lessons_completed',
          scopeType: 'cohort',
          scopeId: 'cohort-1',
          periodType: 'week',
          periodStart,
          periodEnd,
        }),
      ).resolves.toBeDefined();
    });
  });

  describe('getAggregates', () => {
    it('returns precomputed aggregates without recomputing values from events', async () => {
      metricDefinitionService.getByKey.mockResolvedValue(makeDefinition());
      analyticsRepository.findMetricAggregates.mockResolvedValue([{ value: 10 } as never]);

      const result = await service.getAggregates({
        metricKey: 'lessons_completed',
        scopeType: 'platform',
        periodType: 'week',
        from: periodStart,
        to: periodEnd,
      });

      expect(analyticsRepository.findEventsByType).not.toHaveBeenCalled();
      expect(result).toEqual([{ value: 10 }]);
    });

    it('blocks a cohort read when the cohort is below the minimum reportable size', async () => {
      analyticsRepository.countCohortMembers.mockResolvedValue(2);

      await expect(
        service.getAggregates({
          metricKey: 'lessons_completed',
          scopeType: 'cohort',
          scopeId: 'cohort-1',
          periodType: 'week',
          from: periodStart,
          to: periodEnd,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects an invalid period range', async () => {
      await expect(
        service.getAggregates({
          metricKey: 'lessons_completed',
          scopeType: 'platform',
          periodType: 'week',
          from: periodEnd,
          to: periodStart,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
