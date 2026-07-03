// P8-044: Create Lesson Help Prompt Template
// buildLessonHelpPromptSections tests.

import {
  buildLessonHelpPromptSections,
  LESSON_HELP_PROMPT_INSTRUCTIONS,
} from '../lesson-help.template';
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
    ...overrides,
  };
}

describe('buildLessonHelpPromptSections', () => {
  it('always includes the template instructions section first', () => {
    const sections = buildLessonHelpPromptSections(makeSnapshot());
    expect(sections[0]).toEqual({
      key: 'templateInstructions',
      content: LESSON_HELP_PROMPT_INSTRUCTIONS,
    });
  });

  it('includes currentLesson and curriculumSkill sections when present', () => {
    const sections = buildLessonHelpPromptSections(
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

  it('omits lesson/skill sections when context fields are null', () => {
    const sections = buildLessonHelpPromptSections(makeSnapshot());
    expect(sections.map((section) => section.key)).toEqual(['templateInstructions']);
  });

  it('never references mastery, level, or difficulty values', () => {
    const sections = buildLessonHelpPromptSections(
      makeSnapshot({ currentLesson: { lessonId: 'lesson-1' } }),
    );
    const serialized = JSON.stringify(sections);
    expect(serialized).not.toMatch(/"mastery":\s*\d/);
    expect(serialized).not.toMatch(/"difficulty":\s*\d/);
  });
});
