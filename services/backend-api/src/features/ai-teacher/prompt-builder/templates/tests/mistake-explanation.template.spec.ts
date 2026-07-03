// P8-045: Create Mistake Explanation Prompt Template
// buildMistakeExplanationPromptSections tests.
//
// P18-031: Updated for the AI Authority Rule — recentMistakes and weakness
// were removed from AiTeacherContextSnapshot, so this template now only
// ever renders the fixed instructions section.

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
    focusDirective: null,
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

  it('renders no other sections, since recentMistakes/weakness no longer exist on context', () => {
    const sections = buildMistakeExplanationPromptSections(makeSnapshot());
    expect(sections.map((section) => section.key)).toEqual(['templateInstructions']);
  });

  it('never references mastery, level, or difficulty values', () => {
    const sections = buildMistakeExplanationPromptSections(makeSnapshot());
    const serialized = JSON.stringify(sections);
    expect(serialized).not.toMatch(/"mastery":\s*\d/);
    expect(serialized).not.toMatch(/"difficulty":\s*\d/);
  });
});
