import { StudentHomeService } from './student-home.service';
import { STUDENT_HOME_SECTIONS } from './student-home.types';

describe('StudentHomeService', () => {
  function build(overrides: Partial<Record<string, jest.Mock>> = {}) {
    const m = (name: string, value: unknown) => overrides[name] ?? jest.fn().mockResolvedValue(value);
    const deps = {
      skillStates: { getSkillStatesForStudent: m('skillStates', { skillStates: [] }) },
      weakness: { getWeaknessRecordsForStudent: m('weaknessRecords', { weaknessRecords: [] }) },
      schedules: { getReviewSchedulesForStudent: m('reviewSchedules', { reviewSchedules: [] }) },
      recs: { getActiveForStudent: m('recommendations', { recommendations: [] }) },
      engagement: {
        getSummary: m('engagementSummary', { goal: {} }),
        getStats: m('engagementStats', { totalXp: 1 }),
      },
      lessons: {
        findContinueLearningLesson: m('continueLearning', null),
        findQuickStartLesson: m('quickStart', null),
        findRecommendedCourse: m('recommendedCourse', null),
      },
      enrollment: { getCurrentEnrollment: m('currentEnrollment', { found: false }) },
      assessments: {
        listDeadlinesForStudent: m('deadlines', { upcoming: [] }),
        getNextAssessment: m('nextAssessment', null),
      },
    };
    const service = new StudentHomeService(
      deps.skillStates as never,
      deps.weakness as never,
      deps.schedules as never,
      deps.recs as never,
      deps.engagement as never,
      deps.lessons as never,
      deps.enrollment as never,
      deps.assessments as never,
    );
    return { service, deps };
  }

  it('returns every section from the same services as the standalone endpoints', async () => {
    const { service, deps } = build();

    const result = await service.getHome('student-1', 'ar');

    expect(result.failedSections).toEqual([]);
    expect(result.engagementStats).toEqual({ totalXp: 1 });
    expect(result.currentEnrollment).toEqual({ found: false });
    expect(deps.skillStates.getSkillStatesForStudent).toHaveBeenCalledWith('student-1');
    expect(deps.lessons.findQuickStartLesson).toHaveBeenCalledWith('student-1', 'ar');
    expect(deps.enrollment.getCurrentEnrollment).toHaveBeenCalledWith('student-1', 'ar');
  });

  it('keeps going when a section fails and names it in failedSections', async () => {
    const { service } = build({
      weaknessRecords: jest.fn().mockRejectedValue(new Error('db down')),
      deadlines: jest.fn().mockRejectedValue(new Error('boom')),
    });

    const result = await service.getHome('student-1', 'en');

    expect(result.weaknessRecords).toBeNull();
    expect(result.deadlines).toBeNull();
    expect(result.skillStates).toEqual({ skillStates: [] });
    expect([...result.failedSections].sort()).toEqual(['deadlines', 'weaknessRecords']);
  });

  it('starts all sections before any of them resolves (no serial awaits)', async () => {
    const release: Array<() => void> = [];
    const pending = () => jest.fn().mockImplementation(() => new Promise((resolve) => release.push(() => resolve(null))));
    const overrides: Record<string, jest.Mock> = {};
    for (const s of STUDENT_HOME_SECTIONS) overrides[s] = pending();
    const { service } = build(overrides);

    const promise = service.getHome('student-1', 'en');
    await Promise.resolve();

    expect(release).toHaveLength(STUDENT_HOME_SECTIONS.length);
    release.forEach((r) => r());
    await promise;
  });
});
