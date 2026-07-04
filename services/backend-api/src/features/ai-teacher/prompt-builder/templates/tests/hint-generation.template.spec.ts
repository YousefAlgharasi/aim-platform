// P8-046: Create Hint Generation Prompt Template
// buildHintGenerationPromptSections tests.
//
// P18-031: Updated for the AI Authority Rule — skillState was removed from
// AiTeacherContextSnapshot.

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
    focusDirective: null,
    difficultyDecision: null,
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

  it('includes currentLesson and curriculumSkill sections when present, in order', () => {
    const sections = buildHintGenerationPromptSections(
      makeSnapshot({
        currentLesson: { lessonId: 'lesson-1' },
        curriculumSkill: { skillId: 'skill-1' },
      }),
    );

    expect(sections.map((section) => section.key)).toEqual([
      'templateInstructions',
      'currentLesson',
      'curriculumSkill',
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
      makeSnapshot({ curriculumSkill: { skillId: 'skill-1' } }),
    );
    const serialized = JSON.stringify(sections);
    expect(serialized).not.toMatch(/"mastery":\s*\d/);
    expect(serialized).not.toMatch(/"difficulty":\s*\d/);
  });
});
