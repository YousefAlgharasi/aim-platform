// P8-038: Add Context Token Budget Policy
// ContextBudgetPolicyService tests.
//
// P18-031: Updated for the AI Authority Rule — placementResult, skillState,
// weakness, recommendation, reviewSchedule, and recentMistakes were removed
// from AiTeacherContextSnapshot.

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
    focusDirective: null,
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
    const oversizedCurriculumSkill = { dump: 'x'.repeat(10000) };
    const snapshot = makeSnapshot({
      currentLesson: { lessonId: 'lesson-1' },
      curriculumSkill: oversizedCurriculumSkill,
    });

    const result = policy.applyBudget(snapshot);

    expect(result.snapshot.currentLesson).toEqual({ lessonId: 'lesson-1' });
    const curriculumSkillUsage = result.fieldUsage.find(
      (usage) => usage.field === 'curriculumSkill',
    );
    expect(curriculumSkillUsage?.dropped).toBe(true);
    expect(result.snapshot.curriculumSkill).toBeNull();
  });

  it('never exceeds the configured total token budget', () => {
    const policy = new ContextBudgetPolicyService();
    const snapshot = makeSnapshot({
      currentLesson: { dump: 'x'.repeat(20000) },
      studentProfile: { dump: 'x'.repeat(20000) },
      curriculumSkill: { dump: 'x'.repeat(20000) },
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
