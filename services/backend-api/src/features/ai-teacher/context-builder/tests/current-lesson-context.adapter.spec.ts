// P8-030: Add Current Lesson Context
// CurrentLessonContextAdapter tests.

import { CurrentLessonContextAdapter } from '../adapters/current-lesson-context.adapter';
import { RecommendationReadService } from '../../../aim/result/recommendation-read.service';
import { LessonsService } from '../../../curriculum/lessons/lessons.service';

function makeMockRecommendations(
  getActiveForStudent: RecommendationReadService['getActiveForStudent'],
) {
  return { getActiveForStudent } as unknown as RecommendationReadService;
}

function makeMockLessons(getLesson: LessonsService['getLesson']) {
  return { getLesson } as unknown as LessonsService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const LESSON_ID = 'ee0e8400-e29b-41d4-a716-446655440009';

const baseRecommendation = {
  id: 'rec-1',
  kind: 'next_lesson',
  targetSkillId: 'skill-1',
  targetLessonId: LESSON_ID,
  rank: 1,
  reason: 'weak_area',
  basedOnWeaknessId: 'weakness-1',
  generatedAt: '2026-06-18T00:00:00Z',
  expiresAt: null,
  status: 'active',
  updatedAt: '2026-06-18T00:00:00Z',
};

describe('CurrentLessonContextAdapter', () => {
  it('resolves the top-ranked active recommendation lesson and maps safe fields only', async () => {
    const recommendations = makeMockRecommendations(async () => ({
      studentId: STUDENT_ID,
      recommendations: [baseRecommendation],
    }));
    const lessons = makeMockLessons(async (id) => ({
      id,
      chapterId: 'chapter-1',
      title: 'Fractions',
      description: 'Intro to fractions',
      status: 'published',
      sortOrder: 1,
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
    }));
    const adapter = new CurrentLessonContextAdapter(recommendations, lessons);
    const context = await adapter.getCurrentLessonContext(STUDENT_ID);

    expect(context).toEqual({
      lessonId: LESSON_ID,
      title: 'Fractions',
      description: 'Intro to fractions',
    });
    // Recommendation-adjacent fields must not leak through.
    expect(context).not.toHaveProperty('reason');
    expect(context).not.toHaveProperty('kind');
    expect(context).not.toHaveProperty('basedOnWeaknessId');
  });

  it('returns null when the student has no active recommendations', async () => {
    const recommendations = makeMockRecommendations(async () => ({
      studentId: STUDENT_ID,
      recommendations: [],
    }));
    const lessons = makeMockLessons(async () => {
      throw new Error('should not be called');
    });
    const adapter = new CurrentLessonContextAdapter(recommendations, lessons);
    const context = await adapter.getCurrentLessonContext(STUDENT_ID);
    expect(context).toBeNull();
  });

  it('returns null when the top recommendation has no targetLessonId', async () => {
    const recommendations = makeMockRecommendations(async () => ({
      studentId: STUDENT_ID,
      recommendations: [{ ...baseRecommendation, targetLessonId: null }],
    }));
    const lessons = makeMockLessons(async () => {
      throw new Error('should not be called');
    });
    const adapter = new CurrentLessonContextAdapter(recommendations, lessons);
    const context = await adapter.getCurrentLessonContext(STUDENT_ID);
    expect(context).toBeNull();
  });

  it('returns null when the referenced lesson no longer exists', async () => {
    const recommendations = makeMockRecommendations(async () => ({
      studentId: STUDENT_ID,
      recommendations: [baseRecommendation],
    }));
    const lessons = makeMockLessons(async () => {
      throw new Error('Lesson not found');
    });
    const adapter = new CurrentLessonContextAdapter(recommendations, lessons);
    const context = await adapter.getCurrentLessonContext(STUDENT_ID);
    expect(context).toBeNull();
  });
});
