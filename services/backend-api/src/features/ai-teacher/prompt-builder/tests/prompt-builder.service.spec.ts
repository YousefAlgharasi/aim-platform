// P8-041: Create AI Teacher Prompt Builder Skeleton
// PromptBuilderService tests.

import { PromptBuilderService } from '../prompt-builder.service';
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS } from '../prompt-builder.constants';

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

describe('PromptBuilderService', () => {
  it('always includes the fixed AIM Engine authority system instructions', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Why is this wrong?',
      context: makeSnapshot(),
    });

    expect(prompt.systemInstructions).toBe(AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS);
  });

  it('omits sections for null or empty context fields', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot(),
    });

    expect(prompt.sections).toEqual([]);
  });

  it('includes sections only for populated context fields, in fixed priority order', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot({
        curriculumSkill: { skillId: 'skill-1' },
        currentLesson: { lessonId: 'lesson-1' },
      }),
    });

    expect(prompt.sections.map((section) => section.key)).toEqual([
      'currentLesson',
      'curriculumSkill',
    ]);
  });

  it('includes the focusDirective section last, after curriculumSkill, when present (P20-013)', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot({
        studentProfile: { displayName: 'Hana' },
        currentLesson: { lessonId: 'lesson-1' },
        curriculumSkill: { skillId: 'skill-1' },
        focusDirective: {
          skillId: 'skill:english:a1:grammar.past-simple',
          directiveText: 'Focus on past simple.',
        },
      }),
    });

    expect(prompt.sections.map((section) => section.key)).toEqual([
      'studentProfile',
      'currentLesson',
      'curriculumSkill',
      'focusDirective',
    ]);
    expect(prompt.sections[prompt.sections.length - 1].content).toContain(
      'Focus on past simple.',
    );
  });

  it('omits the focusDirective section when no active directive exists', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot({ curriculumSkill: { skillId: 'skill-1' } }),
    });

    expect(prompt.sections.map((section) => section.key)).not.toContain('focusDirective');
  });

  it('passes the student message through unchanged', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'What does "run" mean?',
      context: makeSnapshot(),
    });

    expect(prompt.studentMessage).toBe('What does "run" mean?');
  });

  it('never injects a mastery, level, or difficulty value not present in context', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot(),
    });

    const serialized = JSON.stringify(prompt);
    expect(serialized).not.toMatch(/"mastery":\s*\d/);
    expect(serialized).not.toMatch(/"difficulty":\s*\d/);
  });
});
