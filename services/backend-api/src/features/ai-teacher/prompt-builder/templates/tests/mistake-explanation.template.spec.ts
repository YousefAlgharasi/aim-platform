// P8-045: Create Mistake Explanation Prompt Template
// buildMistakeExplanationPromptSections tests.

import {
  buildMistakeExplanationPromptSections,
  MISTAKE_EXPLANATION_PROMPT_INSTRUCTIONS,
} from '../mistake-explanation.template';
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

describe('buildMistakeExplanationPromptSections', () => {
  it('always includes the template instructions section first', () => {
    const sections = buildMistakeExplanationPromptSections(makeSnapshot());
    expect(sections[0]).toEqual({
      key: 'templateInstructions',
      content: MISTAKE_EXPLANATION_PROMPT_INSTRUCTIONS,
    });
  });

  it('includes recentMistakes and weakness sections when present', () => {
    const sections = buildMistakeExplanationPromptSections(
      makeSnapshot({
        recentMistakes: [{ skillId: 'skill-1', patternType: 'past_tense' }],
        weakness: { skillId: 'skill-1', severity: 'high' },
      }),
    );

    expect(sections.map((section) => section.key)).toEqual([
      'templateInstructions',
      'recentMistakes',
      'weakness',
    ]);
  });

  it('omits recentMistakes section when the array is empty', () => {
    const sections = buildMistakeExplanationPromptSections(makeSnapshot({ recentMistakes: [] }));
    expect(sections.map((section) => section.key)).toEqual(['templateInstructions']);
  });

  it('omits weakness section when null', () => {
    const sections = buildMistakeExplanationPromptSections(
      makeSnapshot({ recentMistakes: [{ skillId: 'skill-1' }], weakness: null }),
    );
    expect(sections.map((section) => section.key)).toEqual([
      'templateInstructions',
      'recentMistakes',
    ]);
  });

  it('never references mastery, level, or difficulty values', () => {
    const sections = buildMistakeExplanationPromptSections(
      makeSnapshot({ recentMistakes: [{ skillId: 'skill-1' }] }),
    );
    const serialized = JSON.stringify(sections);
    expect(serialized).not.toMatch(/"mastery":\s*\d/);
    expect(serialized).not.toMatch(/"difficulty":\s*\d/);
  });
});
