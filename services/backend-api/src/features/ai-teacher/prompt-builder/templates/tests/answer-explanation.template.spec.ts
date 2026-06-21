// P8-047: Create Answer Explanation Prompt Template
// buildAnswerExplanationPromptSections tests.

import {
  buildAnswerExplanationPromptSections,
  ANSWER_EXPLANATION_PROMPT_INSTRUCTIONS,
} from '../answer-explanation.template';
import { AiTeacherContextSnapshot } from '../../../context-builder/context-builder.types';

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

describe('buildAnswerExplanationPromptSections', () => {
  it('always includes the template instructions section first', () => {
    const sections = buildAnswerExplanationPromptSections(makeSnapshot());
    expect(sections[0]).toEqual({
      key: 'templateInstructions',
      content: ANSWER_EXPLANATION_PROMPT_INSTRUCTIONS,
    });
  });

  it('includes curriculumSkill, skillState, and recentMistakes sections when present, in order', () => {
    const sections = buildAnswerExplanationPromptSections(
      makeSnapshot({
        curriculumSkill: { skillId: 'skill-1' },
        skillState: { skillId: 'skill-1', state: 'learning' },
        recentMistakes: [{ skillId: 'skill-1', patternType: 'past_tense' }],
      }),
    );

    expect(sections.map((section) => section.key)).toEqual([
      'templateInstructions',
      'curriculumSkill',
      'skillState',
      'recentMistakes',
    ]);
  });

  it('omits sections for null or empty fields', () => {
    const sections = buildAnswerExplanationPromptSections(makeSnapshot());
    expect(sections.map((section) => section.key)).toEqual(['templateInstructions']);
  });

  it('never references mastery, level, or difficulty values', () => {
    const sections = buildAnswerExplanationPromptSections(
      makeSnapshot({ skillState: { skillId: 'skill-1' } }),
    );
    const serialized = JSON.stringify(sections);
    expect(serialized).not.toMatch(/"mastery":\s*\d/);
    expect(serialized).not.toMatch(/"difficulty":\s*\d/);
  });
});
