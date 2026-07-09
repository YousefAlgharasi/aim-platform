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
    difficultyDecision: null,
    emotionalState: null,
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

  it('includes the difficultyDecision section last, after focusDirective, when present (P20-018)', () => {
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
        difficultyDecision: {
          skillId: 'skill:english:a1:vocab.daily-routines',
          rationale: 'consistent_performance',
        },
      }),
    });

    expect(prompt.sections.map((section) => section.key)).toEqual([
      'studentProfile',
      'currentLesson',
      'curriculumSkill',
      'focusDirective',
      'difficultyDecision',
    ]);
    expect(prompt.sections[prompt.sections.length - 1].content).toContain(
      'consistent_performance',
    );
  });

  it('omits the difficultyDecision section when no decision exists', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot({ curriculumSkill: { skillId: 'skill-1' } }),
    });

    expect(prompt.sections.map((section) => section.key)).not.toContain('difficultyDecision');
  });

  it('includes the emotionalState section last, after difficultyDecision, when present (P20-020)', () => {
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
        difficultyDecision: {
          skillId: 'skill:english:a1:vocab.daily-routines',
          rationale: 'consistent_performance',
        },
        emotionalState: {
          frustrationLevel: 'moderate',
          engagementLevel: 'typical',
        },
      }),
    });

    expect(prompt.sections.map((section) => section.key)).toEqual([
      'studentProfile',
      'currentLesson',
      'curriculumSkill',
      'focusDirective',
      'difficultyDecision',
      'emotionalState',
    ]);
    expect(prompt.sections[prompt.sections.length - 1].content).toContain('moderate');
  });

  it('omits the emotionalState section when no recent session summary exists', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot({ curriculumSkill: { skillId: 'skill-1' } }),
    });

    expect(prompt.sections.map((section) => section.key)).not.toContain('emotionalState');
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

  it('uses greeting-stage instructions when lessonStage is greeting', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot(),
      lessonStage: 'greeting',
    });

    expect(prompt.systemInstructions).toContain('ask whether they');
    expect(prompt.systemInstructions).not.toContain('LESSON_COMPLETE');
  });

  it('uses teaching-stage instructions with the completion-marker protocol when lessonStage is teaching', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot(),
      lessonStage: 'teaching',
    });

    expect(prompt.systemInstructions).toContain('[[LESSON_COMPLETE]]');
    expect(prompt.systemInstructions).toContain('wait for their reply');
  });

  it('uses complete-stage instructions that forbid re-emitting the marker', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Can you explain that again?',
      context: makeSnapshot(),
      lessonStage: 'complete',
    });

    expect(prompt.systemInstructions).toContain('already been marked finished');
    expect(prompt.systemInstructions).toContain('never write [[LESSON_COMPLETE]]');
  });

  it('omits the conversationHistory section when no history is given', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'Hello',
      context: makeSnapshot(),
    });

    expect(prompt.sections.map((s) => s.key)).not.toContain('conversationHistory');
  });

  it('renders prior turns as a conversationHistory section, oldest first, for memory', () => {
    const service = new PromptBuilderService();
    const prompt = service.buildPrompt({
      studentMessage: 'And after that?',
      context: makeSnapshot(),
      history: [
        { role: 'ai_teacher', text: 'Today we will learn the verb "to be".' },
        { role: 'student', text: 'Okay!' },
      ],
    });

    const historySection = prompt.sections.find((s) => s.key === 'conversationHistory');
    expect(historySection).toBeDefined();
    expect(historySection?.content).toBe(
      'AI Teacher: Today we will learn the verb "to be".\nStudent: Okay!',
    );
  });
});
