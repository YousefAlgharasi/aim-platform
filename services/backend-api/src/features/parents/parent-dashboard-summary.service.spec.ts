// P12-026: Create Parent Dashboard Summary Service
// ParentDashboardSummaryService unit tests.

import { ParentDashboardSummaryService } from './parent-dashboard-summary.service';
import { ParentAccessScopeEntity } from './dto/parent-access-scope.entity';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';

function makeScope(grantedConsentTypes: string[]): ParentAccessScopeEntity {
  const scope = new ParentAccessScopeEntity();
  scope.parentId = PARENT_ID;
  scope.childId = CHILD_ID;
  scope.parentChildLinkId = 'link-uuid-001';
  scope.linkStatus = 'active';
  scope.grantedConsentTypes = grantedConsentTypes as ParentAccessScopeEntity['grantedConsentTypes'];
  return scope;
}

function buildService(overrides: {
  grantedConsentTypes?: string[];
  skillStates?: Array<{ masteryTrend: string; lastEvaluatedAt: string }>;
  weaknessRecords?: Array<{ status: string }>;
  upcoming?: unknown[];
  displayName?: string | null;
}) {
  const parentAccessPolicyService = {
    listAccessibleChildIds: jest.fn().mockResolvedValue([CHILD_ID]),
  };
  const parentConsentService = {
    resolveAccessScope: jest.fn().mockResolvedValue(makeScope(overrides.grantedConsentTypes ?? [])),
  };
  const studentsService = {
    findByUserId: jest.fn().mockResolvedValue(
      overrides.displayName === undefined
        ? { displayName: 'Kid One' }
        : overrides.displayName === null
          ? null
          : { displayName: overrides.displayName },
    ),
  };
  const studentSkillStateReadService = {
    getSkillStatesForStudent: jest.fn().mockResolvedValue({
      studentId: CHILD_ID,
      skillStates: overrides.skillStates ?? [],
    }),
  };
  const weaknessRecordsReadService = {
    getWeaknessRecordsForStudent: jest.fn().mockResolvedValue({
      studentId: CHILD_ID,
      weaknessRecords: overrides.weaknessRecords ?? [],
    }),
  };
  const assessmentService = {
    listDeadlinesForStudent: jest.fn().mockResolvedValue({
      upcoming: overrides.upcoming ?? [],
      active: [],
      late: [],
      missed: [],
      closed: [],
    }),
  };

  const service = new ParentDashboardSummaryService(
    parentAccessPolicyService as never,
    parentConsentService as never,
    studentsService as never,
    studentSkillStateReadService as never,
    weaknessRecordsReadService as never,
    assessmentService as never,
  );

  return {
    service,
    parentAccessPolicyService,
    parentConsentService,
    studentSkillStateReadService,
    weaknessRecordsReadService,
    assessmentService,
  };
}

describe('ParentDashboardSummaryService', () => {
  it('returns one child entry per accessible child id', async () => {
    const { service } = buildService({});
    const summary = await service.getSummaryForParent(PARENT_ID);

    expect(summary.parentId).toBe(PARENT_ID);
    expect(summary.children).toHaveLength(1);
    expect(summary.children[0].childId).toBe(CHILD_ID);
  });

  it('returns null progress/weakness/deadline fields when no consent is granted', async () => {
    const { service, studentSkillStateReadService, weaknessRecordsReadService, assessmentService } =
      buildService({ grantedConsentTypes: [] });

    const summary = await service.getSummaryForParent(PARENT_ID);

    expect(summary.children[0].progressLabel).toBeNull();
    expect(summary.children[0].hasOpenWeaknesses).toBeNull();
    expect(summary.children[0].upcomingDeadlineCount).toBeNull();
    expect(studentSkillStateReadService.getSkillStatesForStudent).not.toHaveBeenCalled();
    expect(weaknessRecordsReadService.getWeaknessRecordsForStudent).not.toHaveBeenCalled();
    expect(assessmentService.listDeadlinesForStudent).not.toHaveBeenCalled();
  });

  it('passes through the most recently evaluated skill mastery trend as progressLabel when progress_view consent is granted', async () => {
    const { service } = buildService({
      grantedConsentTypes: ['progress_view'],
      skillStates: [
        { masteryTrend: 'declining', lastEvaluatedAt: '2026-01-01T00:00:00.000Z' },
        { masteryTrend: 'improving', lastEvaluatedAt: '2026-06-01T00:00:00.000Z' },
      ],
    });

    const summary = await service.getSummaryForParent(PARENT_ID);

    expect(summary.children[0].progressLabel).toBe('improving');
  });

  it('sets hasOpenWeaknesses true when at least one weakness record has status "open"', async () => {
    const { service } = buildService({
      grantedConsentTypes: ['progress_view'],
      weaknessRecords: [{ status: 'resolved' }, { status: 'open' }],
    });

    const summary = await service.getSummaryForParent(PARENT_ID);

    expect(summary.children[0].hasOpenWeaknesses).toBe(true);
  });

  it('sets upcomingDeadlineCount from the assessment service upcoming bucket when assessment_view consent is granted', async () => {
    const { service } = buildService({
      grantedConsentTypes: ['assessment_view'],
      upcoming: [{}, {}, {}],
    });

    const summary = await service.getSummaryForParent(PARENT_ID);

    expect(summary.children[0].upcomingDeadlineCount).toBe(3);
  });

  it('grants both progress and assessment data when full_access consent is held', async () => {
    const { service } = buildService({
      grantedConsentTypes: ['full_access'],
      skillStates: [{ masteryTrend: 'stable', lastEvaluatedAt: '2026-01-01T00:00:00.000Z' }],
      weaknessRecords: [{ status: 'open' }],
      upcoming: [{}],
    });

    const summary = await service.getSummaryForParent(PARENT_ID);

    expect(summary.children[0].progressLabel).toBe('stable');
    expect(summary.children[0].hasOpenWeaknesses).toBe(true);
    expect(summary.children[0].upcomingDeadlineCount).toBe(1);
  });

  it('falls back to the child id as displayName when no student profile exists', async () => {
    const { service } = buildService({ displayName: null });
    const summary = await service.getSummaryForParent(PARENT_ID);

    expect(summary.children[0].displayName).toBe(CHILD_ID);
  });
});
