import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { ReportDefinitionService } from './report-definition.service';
import { AnalyticsRepository } from './analytics.repository';
import { ReportDefinition } from './analytics.entities';

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

describe('ReportDefinitionService', () => {
  let analyticsRepository: jest.Mocked<
    Pick<AnalyticsRepository, 'findActiveReportDefinitions' | 'findReportDefinitionByKey'>
  >;
  let service: ReportDefinitionService;

  beforeEach(() => {
    analyticsRepository = {
      findActiveReportDefinitions: jest.fn(),
      findReportDefinitionByKey: jest.fn(),
    };
    service = new ReportDefinitionService(analyticsRepository as unknown as AnalyticsRepository);
  });

  describe('listVisibleToRole', () => {
    it('filters active definitions down to those visible to the role', async () => {
      analyticsRepository.findActiveReportDefinitions.mockResolvedValue([
        makeDefinition({ key: 'admin-only', allowedRoles: ['admin'] }),
        makeDefinition({ key: 'learning-progress', allowedRoles: ['admin', 'parent', 'student'] }),
      ]);

      const result = await service.listVisibleToRole('student');

      expect(result.map((d) => d.key)).toEqual(['learning-progress']);
    });

    it('returns an empty list (empty state) when no active definitions are visible to the role', async () => {
      analyticsRepository.findActiveReportDefinitions.mockResolvedValue([
        makeDefinition({ key: 'admin-only', allowedRoles: ['admin'] }),
      ]);

      const result = await service.listVisibleToRole('student');

      expect(result).toEqual([]);
    });

    it('returns an empty list when there are no active definitions at all', async () => {
      analyticsRepository.findActiveReportDefinitions.mockResolvedValue([]);

      const result = await service.listVisibleToRole('admin');

      expect(result).toEqual([]);
    });
  });

  describe('getByKeyForRole', () => {
    it('returns the definition when the role is allowed', async () => {
      analyticsRepository.findReportDefinitionByKey.mockResolvedValue(makeDefinition());

      const result = await service.getByKeyForRole('learning-progress', 'parent');

      expect(result.key).toBe('learning-progress');
    });

    it('throws not found for an invalid/unknown report key', async () => {
      analyticsRepository.findReportDefinitionByKey.mockResolvedValue(null);

      await expect(service.getByKeyForRole('does-not-exist', 'admin')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws forbidden when the role is not in the definition\'s allowed roles', async () => {
      analyticsRepository.findReportDefinitionByKey.mockResolvedValue(
        makeDefinition({ allowedRoles: ['admin'] }),
      );

      await expect(service.getByKeyForRole('admin-only', 'student')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
