// P8-031: Add Curriculum Skill Context
// CurriculumSkillContextAdapter tests.

import { CurriculumSkillContextAdapter } from '../adapters/curriculum-skill-context.adapter';
import { RecommendationReadService } from '../../../aim/result/recommendation-read.service';
import { SkillsService } from '../../../curriculum/skills/skills.service';

function makeMockRecommendations(
  getActiveForStudent: RecommendationReadService['getActiveForStudent'],
) {
  return { getActiveForStudent } as unknown as RecommendationReadService;
}

function makeMockSkills(getSkill: SkillsService['getSkill']) {
  return { getSkill } as unknown as SkillsService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const SKILL_ID = 'ff0e8400-e29b-41d4-a716-446655440010';

const baseRecommendation = {
  id: 'rec-1',
  kind: 'next_lesson',
  targetSkillId: SKILL_ID,
  targetLessonId: 'lesson-1',
  rank: 1,
  reason: 'weak_area',
  basedOnWeaknessId: 'weakness-1',
  generatedAt: '2026-06-18T00:00:00Z',
  expiresAt: null,
  status: 'active',
  updatedAt: '2026-06-18T00:00:00Z',
};

describe('CurriculumSkillContextAdapter', () => {
  it('resolves the top-ranked active recommendation skill and maps safe fields only', async () => {
    const recommendations = makeMockRecommendations(async () => ({
      studentId: STUDENT_ID,
      recommendations: [baseRecommendation],
    }));
    const skills = makeMockSkills(async (id) => ({
      id,
      key: 'grammar.past_simple.forms',
      title: 'Past Simple Forms',
      description: 'Regular and irregular past simple forms',
      domain: 'grammar',
      parentSkillId: null,
      status: 'published',
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
    }));
    const adapter = new CurriculumSkillContextAdapter(recommendations, skills);
    const context = await adapter.getSkillContext(STUDENT_ID);

    expect(context).toEqual({
      skillId: SKILL_ID,
      key: 'grammar.past_simple.forms',
      title: 'Past Simple Forms',
      domain: 'grammar',
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
    const skills = makeMockSkills(async () => {
      throw new Error('should not be called');
    });
    const adapter = new CurriculumSkillContextAdapter(recommendations, skills);
    const context = await adapter.getSkillContext(STUDENT_ID);
    expect(context).toBeNull();
  });

  it('returns null when the referenced skill no longer exists', async () => {
    const recommendations = makeMockRecommendations(async () => ({
      studentId: STUDENT_ID,
      recommendations: [baseRecommendation],
    }));
    const skills = makeMockSkills(async () => {
      throw new Error('Skill not found');
    });
    const adapter = new CurriculumSkillContextAdapter(recommendations, skills);
    const context = await adapter.getSkillContext(STUDENT_ID);
    expect(context).toBeNull();
  });
});
