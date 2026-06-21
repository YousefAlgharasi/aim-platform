import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CohortService } from './cohort.service';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsCohort, AnalyticsCohortMember } from './analytics.entities';

function makeCohort(overrides: Partial<AnalyticsCohort> = {}): AnalyticsCohort {
  return {
    id: 'cohort-1',
    key: 'grade-5-fall',
    name: 'Grade 5 — Fall',
    description: null,
    cohortType: 'dynamic',
    definition: {},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMembers(count: number): AnalyticsCohortMember[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `member-${i}`,
    cohortId: 'cohort-1',
    userId: `user-${i}`,
    addedAt: new Date(),
  }));
}

describe('CohortService', () => {
  let analyticsRepository: jest.Mocked<
    Pick<
      AnalyticsRepository,
      'findActiveCohorts' | 'findCohortByKey' | 'addCohortMember' | 'removeCohortMember' | 'countCohortMembers' | 'findCohortMembers'
    >
  >;
  let service: CohortService;

  beforeEach(() => {
    analyticsRepository = {
      findActiveCohorts: jest.fn(),
      findCohortByKey: jest.fn(),
      addCohortMember: jest.fn(),
      removeCohortMember: jest.fn(),
      countCohortMembers: jest.fn(),
      findCohortMembers: jest.fn(),
    };
    service = new CohortService(analyticsRepository as unknown as AnalyticsRepository);
  });

  describe('resolveReportableMembers', () => {
    it('suppresses cohort membership when the cohort has fewer than 5 distinct members', async () => {
      analyticsRepository.countCohortMembers.mockResolvedValue(4);

      await expect(service.resolveReportableMembers('cohort-1')).rejects.toBeInstanceOf(ForbiddenException);
      expect(analyticsRepository.findCohortMembers).not.toHaveBeenCalled();
    });

    it('suppresses an empty cohort', async () => {
      analyticsRepository.countCohortMembers.mockResolvedValue(0);

      await expect(service.resolveReportableMembers('cohort-1')).rejects.toBeInstanceOf(ForbiddenException);
      expect(analyticsRepository.findCohortMembers).not.toHaveBeenCalled();
    });

    it('returns membership once the cohort meets the minimum reportable size (5)', async () => {
      analyticsRepository.countCohortMembers.mockResolvedValue(5);
      analyticsRepository.findCohortMembers.mockResolvedValue(makeMembers(5));

      const result = await service.resolveReportableMembers('cohort-1');

      expect(result).toHaveLength(5);
      expect(analyticsRepository.findCohortMembers).toHaveBeenCalledWith('cohort-1');
    });

    it('returns membership for cohorts larger than the minimum', async () => {
      analyticsRepository.countCohortMembers.mockResolvedValue(50);
      analyticsRepository.findCohortMembers.mockResolvedValue(makeMembers(50));

      const result = await service.resolveReportableMembers('cohort-1');

      expect(result).toHaveLength(50);
    });
  });

  describe('getByKey', () => {
    it('throws not found for an unknown cohort key rather than leaking partial data', async () => {
      analyticsRepository.findCohortByKey.mockResolvedValue(null);

      await expect(service.getByKey('missing-cohort')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the cohort definition when found', async () => {
      analyticsRepository.findCohortByKey.mockResolvedValue(makeCohort());

      const result = await service.getByKey('grade-5-fall');

      expect(result.key).toBe('grade-5-fall');
    });
  });
});
