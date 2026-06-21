// P8-046: Create Hint Generation Prompt Template
// buildHintGenerationPromptSections tests.

import {
  buildHintGenerationPromptSections,
  HINT_GENERATION_PROMPT_INSTRUCTIONS,
} from '../hint-generation.template';
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

describe('buildHintGenerationPromptSections', () => {
  it('always includes the template instructions section first', () => {
    const sections = buildHintGenerationPromptSections(makeSnapshot());
    expect(sections[0]).toEqual({
      key: 'templateInstructions',
      content: HINT_GENERATION_PROMPT_INSTRUCTIONS,
    });
  });

  it('includes currentLesson, curriculumSkill, and skillState sections when present, in order', () => {
    const sections = buildHintGenerationPromptSections(
      makeSnapshot({
        currentLesson: { lessonId: 'lesson-1' },
        curriculumSkill: { skillId: 'skill-1' },
        skillState: { skillId: 'skill-1', state: 'learning' },
      }),
    );

    expect(sections.map((section) => section.key)).toEqual([
      'templateInstructions',
      'currentLesson',
      'curriculumSkill',
      'skillState',
    ]);
  });

  it('omits sections for null fields', () => {
    const sections = buildHintGenerationPromptSections(makeSnapshot());
    expect(sections.map((section) => section.key)).toEqual(['templateInstructions']);
  });

  it('instructs giving hints rather than direct answers', () => {
    const sections = buildHintGenerationPromptSections(makeSnapshot());
    expect(sections[0].content).toContain('not the final answer');
  });

  it('never references mastery, level, or difficulty values', () => {
    const sections = buildHintGenerationPromptSections(
      makeSnapshot({ skillState: { skillId: 'skill-1' } }),
    );
    const serialized = JSON.stringify(sections);
    expect(serialized).not.toMatch(/"mastery":\s*\d/);
    expect(serialized).not.toMatch(/"difficulty":\s*\d/);
  });
});
