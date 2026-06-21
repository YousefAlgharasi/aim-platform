// P8-038: Add Context Token Budget Policy
// ContextBudgetPolicyService tests.

import { ContextBudgetPolicyService } from '../context-budget-policy.service';
import { AiTeacherContextSnapshot } from '../context-builder.types';

function makeSnapshot(
  overrides: Partial<AiTeacherContextSnapshot> = {},
): AiTeacherContextSnapshot {
  return {
    studentId: 'student-1',
    sessionId: 'session-1',
    studentProfile: null,
    currentLesson: null,
    curriculumSkill: null,
    placementResult: null,
    skillState: null,
    weakness: null,
    recommendation: null,
    reviewSchedule: null,
    recentMistakes: [],
    ...overrides,
  };
}

describe('ContextBudgetPolicyService', () => {
  it('keeps all fields untouched when total context is within budget', () => {
    const policy = new ContextBudgetPolicyService();
    const snapshot = makeSnapshot({
      currentLesson: { lessonId: 'lesson-1' },
      studentProfile: { level: 'A1' },
    });

    const result = policy.applyBudget(snapshot);

    expect(result.snapshot.currentLesson).toEqual({ lessonId: 'lesson-1' });
    expect(result.snapshot.studentProfile).toEqual({ level: 'A1' });
    expect(result.fieldUsage.every((usage) => !usage.dropped)).toBe(true);
  });

  it('drops lowest-priority non-truncatable fields first when budget is exceeded', () => {
    const policy = new ContextBudgetPolicyService();
    const oversizedPlacementResult = { dump: 'x'.repeat(10000) };
    const snapshot = makeSnapshot({
      currentLesson: { lessonId: 'lesson-1' },
      placementResult: oversizedPlacementResult,
    });

    const result = policy.applyBudget(snapshot);

    expect(result.snapshot.currentLesson).toEqual({ lessonId: 'lesson-1' });
    const placementUsage = result.fieldUsage.find((usage) => usage.field === 'placementResult');
    expect(placementUsage?.dropped).toBe(true);
    expect(result.snapshot.placementResult).toBeNull();
  });

  it('truncates recentMistakes array when it exceeds its field budget', () => {
    const policy = new ContextBudgetPolicyService();
    const recentMistakes = Array.from({ length: 50 }, (_, index) => ({
      questionId: `q-${index}`,
      detail: 'x'.repeat(50),
    }));
    const snapshot = makeSnapshot({ recentMistakes });

    const result = policy.applyBudget(snapshot);

    const usage = result.fieldUsage.find((entry) => entry.field === 'recentMistakes');
    expect(usage?.truncated).toBe(true);
    expect((result.snapshot.recentMistakes as unknown[]).length).toBeLessThan(
      recentMistakes.length,
    );
  });

  it('never marks AIM Engine authoritative fields as truncated', () => {
    const policy = new ContextBudgetPolicyService();
    const snapshot = makeSnapshot({
      skillState: { skillId: 'skill-1', state: 'x'.repeat(5000) },
      weakness: { records: [{ skillId: 'skill-1', severity: 'high' }] },
    });

    const result = policy.applyBudget(snapshot);

    const skillStateUsage = result.fieldUsage.find((usage) => usage.field === 'skillState');
    expect(skillStateUsage?.truncated).toBe(false);
  });

  it('never exceeds the configured total token budget', () => {
    const policy = new ContextBudgetPolicyService();
    const snapshot = makeSnapshot({
      currentLesson: { dump: 'x'.repeat(20000) },
      studentProfile: { dump: 'x'.repeat(20000) },
      skillState: { dump: 'x'.repeat(20000) },
      weakness: { dump: 'x'.repeat(20000) },
      curriculumSkill: { dump: 'x'.repeat(20000) },
      recentMistakes: Array.from({ length: 200 }, (_, i) => ({ id: i, dump: 'x'.repeat(50) })),
      recommendation: { dump: 'x'.repeat(20000) },
      reviewSchedule: { dump: 'x'.repeat(20000) },
      placementResult: { dump: 'x'.repeat(20000) },
    });

    const result = policy.applyBudget(snapshot);

    expect(result.totalUsedTokens).toBeLessThanOrEqual(result.totalBudgetTokens);
  });

  it('does not mutate studentId or sessionId', () => {
    const policy = new ContextBudgetPolicyService();
    const snapshot = makeSnapshot();

    const result = policy.applyBudget(snapshot);

    expect(result.snapshot.studentId).toBe(snapshot.studentId);
    expect(result.snapshot.sessionId).toBe(snapshot.sessionId);
  });
});
