// P12-031: Create Parent Children API
// ParentsController unit tests.

import { ParentsController } from './parents.controller';

const PARENT_ID = 'parent-uuid-001';

function buildController(overrides: {
  links?: Array<Record<string, unknown>>;
  findByUserId?: jest.Mock;
  getSummaryForParent?: jest.Mock;
  getProgressForParent?: jest.Mock;
  getAssessmentSummaryForParent?: jest.Mock;
} = {}) {
  const parentChildLinkService = {
    listLinksForParent: jest.fn().mockResolvedValue(
      overrides.links ?? [
        {
          id: 'link-1',
          parentId: PARENT_ID,
          childId: 'child-1',
          relationshipType: 'parent',
          status: 'active',
        },
      ],
    ),
  };

  const studentsService = {
    findByUserId:
      overrides.findByUserId ?? jest.fn().mockResolvedValue({ displayName: 'Child One' }),
  };

  const parentDashboardSummaryService = {
    getSummaryForParent:
      overrides.getSummaryForParent ??
      jest.fn().mockResolvedValue({ parentId: PARENT_ID, children: [] }),
  };

  const parentChildProgressService = {
    getProgressForParent:
      overrides.getProgressForParent ??
      jest.fn().mockResolvedValue({ childId: 'child-1', skillStates: [] }),
  };

  const parentAssessmentSummaryService = {
    getAssessmentSummaryForParent:
      overrides.getAssessmentSummaryForParent ??
      jest.fn().mockResolvedValue({ childId: 'child-1', results: [], upcomingAssessments: [] }),
  };

  const controller = new ParentsController(
    parentChildLinkService as never,
    studentsService as never,
    parentDashboardSummaryService as never,
    parentChildProgressService as never,
    parentAssessmentSummaryService as never,
  );

  return {
    controller,
    parentChildLinkService,
    studentsService,
    parentDashboardSummaryService,
    parentChildProgressService,
    parentAssessmentSummaryService,
  };
}

describe('ParentsController', () => {
  describe('listChildren', () => {
    it('lists links for the authenticated parent', async () => {
      const { controller, parentChildLinkService } = buildController();

      await controller.listChildren({ id: PARENT_ID } as never);

      expect(parentChildLinkService.listLinksForParent).toHaveBeenCalledWith(PARENT_ID);
    });

    it('excludes revoked links', async () => {
      const { controller } = buildController({
        links: [
          { id: 'l1', childId: 'child-1', relationshipType: 'parent', status: 'active' },
          { id: 'l2', childId: 'child-2', relationshipType: 'parent', status: 'revoked' },
        ],
      });

      const result = await controller.listChildren({ id: PARENT_ID } as never);

      expect(result).toHaveLength(1);
      expect(result[0].childId).toBe('child-1');
    });

    it('maps childId, displayName, relationshipType, and linkStatus', async () => {
      const { controller } = buildController();

      const result = await controller.listChildren({ id: PARENT_ID } as never);

      expect(result).toEqual([
        {
          childId: 'child-1',
          displayName: 'Child One',
          relationshipType: 'parent',
          linkStatus: 'active',
        },
      ]);
    });

    it('falls back to childId as displayName when no student profile exists', async () => {
      const { controller } = buildController({
        findByUserId: jest.fn().mockResolvedValue(null),
      });

      const result = await controller.listChildren({ id: PARENT_ID } as never);

      expect(result[0].displayName).toBe('child-1');
    });
  });

  describe('getDashboardSummary', () => {
    it('delegates to ParentDashboardSummaryService for the authenticated parent', async () => {
      const { controller, parentDashboardSummaryService } = buildController();

      const result = await controller.getDashboardSummary({ id: PARENT_ID } as never);

      expect(parentDashboardSummaryService.getSummaryForParent).toHaveBeenCalledWith(PARENT_ID);
      expect(result).toEqual({ parentId: PARENT_ID, children: [] });
    });
  });

  describe('getChildProgress', () => {
    it('delegates to ParentChildProgressService with the authenticated parent and route childId', async () => {
      const { controller, parentChildProgressService } = buildController();

      const result = await controller.getChildProgress({ id: PARENT_ID } as never, 'child-1');

      expect(parentChildProgressService.getProgressForParent).toHaveBeenCalledWith(PARENT_ID, 'child-1');
      expect(result).toEqual({ childId: 'child-1', skillStates: [] });
    });
  });

  describe('getChildAssessments', () => {
    it('delegates to ParentAssessmentSummaryService with the authenticated parent and route childId', async () => {
      const { controller, parentAssessmentSummaryService } = buildController();

      const result = await controller.getChildAssessments({ id: PARENT_ID } as never, 'child-1');

      expect(parentAssessmentSummaryService.getAssessmentSummaryForParent).toHaveBeenCalledWith(
        PARENT_ID,
        'child-1',
      );
      expect(result).toEqual({ childId: 'child-1', results: [], upcomingAssessments: [] });
    });
  });
});
