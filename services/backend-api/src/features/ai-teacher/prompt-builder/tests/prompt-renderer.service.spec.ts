// P8-051: Build Prompt Renderer.
// PromptRendererService tests.

import { PromptRendererService } from '../prompt-renderer.service';
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS } from '../prompt-builder.constants';
import { SAFETY_INSTRUCTION_PROMPT_TEMPLATE_KEY } from '../templates/safety-instruction.template';
import { NO_DIAGNOSIS_POLICY_KEY } from '../policies/no-diagnosis.policy';
import { NO_AUTHORITY_CHANGE_POLICY_KEY } from '../policies/no-authority-change.policy';
import { LESSON_HELP_PROMPT_TEMPLATE_KEY } from '../templates/lesson-help.template';
import { HINT_GENERATION_PROMPT_TEMPLATE_KEY } from '../templates/hint-generation.template';

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

describe('PromptRendererService', () => {
  it('always includes the fixed AIM Engine authority system instructions', () => {
    const service = new PromptRendererService();
    const prompt = service.renderPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot(),
      useCase: 'general',
    });

    expect(prompt.systemInstructions).toBe(AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS);
  });

  it('always appends the safety/policy footer in fixed order, even for the general use case', () => {
    const service = new PromptRendererService();
    const prompt = service.renderPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot(),
      useCase: 'general',
    });

    const footerKeys = prompt.sections.slice(-3).map((section) => section.key);
    expect(footerKeys).toEqual([
      SAFETY_INSTRUCTION_PROMPT_TEMPLATE_KEY,
      NO_DIAGNOSIS_POLICY_KEY,
      NO_AUTHORITY_CHANGE_POLICY_KEY,
    ]);
  });

  it('includes the selected use-case template sections between behavior and footer', () => {
    const service = new PromptRendererService();
    const prompt = service.renderPrompt({
      studentMessage: 'Can you help with this lesson?',
      context: makeSnapshot({ currentLesson: { lessonId: 'lesson-1' } }),
      useCase: LESSON_HELP_PROMPT_TEMPLATE_KEY,
    });

    const sectionKeys = prompt.sections.map((section) => section.key);
    expect(sectionKeys).toEqual([
      'templateInstructions',
      'templateInstructions',
      'currentLesson',
      SAFETY_INSTRUCTION_PROMPT_TEMPLATE_KEY,
      NO_DIAGNOSIS_POLICY_KEY,
      NO_AUTHORITY_CHANGE_POLICY_KEY,
    ]);
  });

  it('omits use-case template sections for context fields that are null', () => {
    const service = new PromptRendererService();
    const prompt = service.renderPrompt({
      studentMessage: 'Give me a hint',
      context: makeSnapshot(),
      useCase: HINT_GENERATION_PROMPT_TEMPLATE_KEY,
    });

    expect(prompt.sections.some((section) => section.key === 'currentLesson')).toBe(false);
    expect(prompt.sections.some((section) => section.key === 'skillState')).toBe(false);
  });

  it('passes the student message through unchanged', () => {
    const service = new PromptRendererService();
    const prompt = service.renderPrompt({
      studentMessage: 'What does "run" mean?',
      context: makeSnapshot(),
      useCase: 'general',
    });

    expect(prompt.studentMessage).toBe('What does "run" mean?');
  });

  it('renders a single stable text combining instructions, sections, and the student message', () => {
    const service = new PromptRendererService();
    const prompt = service.renderPrompt({
      studentMessage: 'Hello there',
      context: makeSnapshot(),
      useCase: 'general',
    });

    expect(prompt.renderedText).toContain(AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS);
    expect(prompt.renderedText).toContain('Student: Hello there');
    expect(prompt.renderedText.indexOf(AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS)).toBeLessThan(
      prompt.renderedText.indexOf('Student: Hello there'),
    );
  });

  it('never injects a mastery, level, or difficulty value not present in context', () => {
    const service = new PromptRendererService();
    const prompt = service.renderPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot(),
      useCase: 'general',
    });

    expect(prompt.renderedText).not.toMatch(/"mastery":\s*\d/);
    expect(prompt.renderedText).not.toMatch(/"difficulty":\s*\d/);
  });
});
