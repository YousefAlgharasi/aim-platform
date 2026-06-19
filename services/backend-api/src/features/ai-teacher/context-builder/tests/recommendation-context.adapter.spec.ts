// P8-035: Add Recommendation Context
// RecommendationContextAdapter tests.

import { RecommendationContextAdapter } from '../adapters/recommendation-context.adapter';
import { RecommendationReadService } from '../../../aim/result/recommendation-read.service';

function makeMockRecommendationRead(
  getActiveForStudent: RecommendationReadService['getActiveForStudent'],
) {
  return { getActiveForStudent } as unknown as RecommendationReadService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

describe('RecommendationContextAdapter', () => {
  it('maps active recommendations to kind, targetSkillId, targetLessonId, rank, reason only', async () => {
    const recommendationRead = makeMockRecommendationRead(async () => ({
      studentId: STUDENT_ID,
      recommendations: [
        {
          id: 'rec-1',
          kind: 'next_lesson',
          targetSkillId: 'skill-1',
          targetLessonId: 'lesson-1',
          rank: 1,
          reason: 'Reinforces a developing skill',
          basedOnWeaknessId: 'weakness-1',
          generatedAt: '2026-06-01T00:00:00Z',
          expiresAt: null,
          status: 'active',
          updatedAt: '2026-06-01T00:00:00Z',
        },
      ],
    }));
    const adapter = new RecommendationContextAdapter(recommendationRead);
    const context = await adapter.getRecommendationContext(STUDENT_ID);

    expect(context).toEqual([
      {
        kind: 'next_lesson',
        targetSkillId: 'skill-1',
        targetLessonId: 'lesson-1',
        rank: 1,
        reason: 'Reinforces a developing skill',
      },
    ]);
    expect(context?.[0]).not.toHaveProperty('id');
    expect(context?.[0]).not.toHaveProperty('basedOnWeaknessId');
    expect(context?.[0]).not.toHaveProperty('generatedAt');
    expect(context?.[0]).not.toHaveProperty('expiresAt');
    expect(context?.[0]).not.toHaveProperty('status');
    expect(context?.[0]).not.toHaveProperty('updatedAt');
  });

  it('returns null when the student has no active recommendations', async () => {
    const recommendationRead = makeMockRecommendationRead(async () => ({
      studentId: STUDENT_ID,
      recommendations: [],
    }));
    const adapter = new RecommendationContextAdapter(recommendationRead);
    const context = await adapter.getRecommendationContext(STUDENT_ID);
    expect(context).toBeNull();
  });

  it('passes studentId through to RecommendationReadService.getActiveForStudent unchanged', async () => {
    const calls: string[] = [];
    const recommendationRead = makeMockRecommendationRead(async (id) => {
      calls.push(id);
      return { studentId: id, recommendations: [] };
    });
    const adapter = new RecommendationContextAdapter(recommendationRead);
    await adapter.getRecommendationContext(STUDENT_ID);
    expect(calls).toEqual([STUDENT_ID]);
  });
});
