// P8-043: Create Tutoring Behavior Prompt Template
// buildTutoringBehaviorPromptSections tests.

import {
  buildTutoringBehaviorPromptSections,
  TUTORING_BEHAVIOR_PROMPT_INSTRUCTIONS,
} from '../tutoring-behavior.template';
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

describe('buildTutoringBehaviorPromptSections', () => {
  it('always includes the template instructions section first', () => {
    const sections = buildTutoringBehaviorPromptSections(makeSnapshot());
    expect(sections[0]).toEqual({
      key: 'templateInstructions',
      content: TUTORING_BEHAVIOR_PROMPT_INSTRUCTIONS,
    });
  });

  it('includes studentProfile section when present', () => {
    const sections = buildTutoringBehaviorPromptSections(
      makeSnapshot({
        studentProfile: { displayName: 'Sara', preferredLanguage: 'ar' },
      }),
    );

    expect(sections.map((section) => section.key)).toEqual([
      'templateInstructions',
      'studentProfile',
    ]);
  });

  it('omits studentProfile section when null', () => {
    const sections = buildTutoringBehaviorPromptSections(makeSnapshot());
    expect(sections.map((section) => section.key)).toEqual(['templateInstructions']);
  });

  it('never references mastery, level, or difficulty values', () => {
    const sections = buildTutoringBehaviorPromptSections(
      makeSnapshot({ studentProfile: { displayName: 'Sara' } }),
    );
    const serialized = JSON.stringify(sections);
    expect(serialized).not.toMatch(/"mastery":\s*\d/);
    expect(serialized).not.toMatch(/"difficulty":\s*\d/);
  });
});
