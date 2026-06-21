// P8-033: Add AIM Skill State Context
// SkillStateContextAdapter tests.

import { SkillStateContextAdapter } from '../adapters/skill-state-context.adapter';
import { StudentSkillStateReadService } from '../../../aim/result/student-skill-state-read.service';

function makeMockSkillStateRead(
  getSkillStatesForStudent: StudentSkillStateReadService['getSkillStatesForStudent'],
) {
  return { getSkillStatesForStudent } as unknown as StudentSkillStateReadService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

describe('SkillStateContextAdapter', () => {
  it('maps skill states to skillId, masteryScore, masteryTrend only', async () => {
    const skillStateRead = makeMockSkillStateRead(async () => ({
      studentId: STUDENT_ID,
      skillStates: [
        {
          skillId: 'skill-1',
          masteryScore: 0.72,
          masteryConfidence: 0.9,
          masteryTrend: 'improving',
          previousMasteryScore: 0.6,
          lastAttemptId: 'attempt-1',
          lastEvaluatedAt: '2026-06-01T00:00:00Z',
          updatedAt: '2026-06-01T00:00:00Z',
        },
      ],
    }));
    const adapter = new SkillStateContextAdapter(skillStateRead);
    const context = await adapter.getSkillStateContext(STUDENT_ID);

    expect(context).toEqual([{ skillId: 'skill-1', masteryScore: 0.72, masteryTrend: 'improving' }]);
    expect(context?.[0]).not.toHaveProperty('masteryConfidence');
    expect(context?.[0]).not.toHaveProperty('previousMasteryScore');
    expect(context?.[0]).not.toHaveProperty('lastAttemptId');
    expect(context?.[0]).not.toHaveProperty('updatedAt');
  });

  it('returns null when the student has no skill states', async () => {
    const skillStateRead = makeMockSkillStateRead(async () => ({
      studentId: STUDENT_ID,
      skillStates: [],
    }));
    const adapter = new SkillStateContextAdapter(skillStateRead);
    const context = await adapter.getSkillStateContext(STUDENT_ID);
    expect(context).toBeNull();
  });

  it('passes studentId through to StudentSkillStateReadService.getSkillStatesForStudent unchanged', async () => {
    const calls: string[] = [];
    const skillStateRead = makeMockSkillStateRead(async (id) => {
      calls.push(id);
      return { studentId: id, skillStates: [] };
    });
    const adapter = new SkillStateContextAdapter(skillStateRead);
    await adapter.getSkillStateContext(STUDENT_ID);
    expect(calls).toEqual([STUDENT_ID]);
  });
});
