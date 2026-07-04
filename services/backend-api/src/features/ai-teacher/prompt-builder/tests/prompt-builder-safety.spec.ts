// P8-052: Add Prompt Builder Tests.
// Dedicated coverage for prompt safety, AIM Engine authority boundaries,
// and full context rendering across every prompt-renderer use case.

import { PromptRendererService } from '../prompt-renderer.service';
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS } from '../prompt-builder.constants';
import {
  SAFETY_INSTRUCTION_PROMPT_TEMPLATE_KEY,
  SAFETY_INSTRUCTION_PROMPT_TEXT,
} from '../templates/safety-instruction.template';
import {
  NO_DIAGNOSIS_POLICY_KEY,
  NO_DIAGNOSIS_POLICY_TEXT,
} from '../policies/no-diagnosis.policy';
import {
  NO_AUTHORITY_CHANGE_POLICY_KEY,
  NO_AUTHORITY_CHANGE_POLICY_TEXT,
} from '../policies/no-authority-change.policy';
import { LESSON_HELP_PROMPT_TEMPLATE_KEY } from '../templates/lesson-help.template';
import { MISTAKE_EXPLANATION_PROMPT_TEMPLATE_KEY } from '../templates/mistake-explanation.template';
import { HINT_GENERATION_PROMPT_TEMPLATE_KEY } from '../templates/hint-generation.template';
import { ANSWER_EXPLANATION_PROMPT_TEMPLATE_KEY } from '../templates/answer-explanation.template';
import { PROMPT_USE_CASE_GENERAL, PromptUseCase } from '../prompt-renderer.types';

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

const ALL_USE_CASES: PromptUseCase[] = [
  PROMPT_USE_CASE_GENERAL,
  LESSON_HELP_PROMPT_TEMPLATE_KEY,
  MISTAKE_EXPLANATION_PROMPT_TEMPLATE_KEY,
  HINT_GENERATION_PROMPT_TEMPLATE_KEY,
  ANSWER_EXPLANATION_PROMPT_TEMPLATE_KEY,
];

describe('Prompt safety and AIM Engine authority boundaries', () => {
  const service = new PromptRendererService();

  describe('system instructions contract (docs/phase-8/system-prompt-contract.md)', () => {
    it.each(ALL_USE_CASES)('states all four required statements for useCase=%s', (useCase) => {
      const prompt = service.renderPrompt({
        studentMessage: 'Hello',
        context: makeSnapshot(),
        useCase,
      });

      expect(prompt.systemInstructions).toBe(AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS);
      expect(prompt.systemInstructions).toMatch(/text-based tutor/);
      expect(prompt.systemInstructions).toMatch(/explain, guide, hint, and answer/);
      expect(prompt.systemInstructions).toMatch(/AIM Engine is the sole authority/);
      expect(prompt.systemInstructions).toMatch(/short, encouraging/);
    });

    it('never embeds a secret-shaped value in the system instructions', () => {
      expect(AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS).not.toMatch(/key|token|password|secret/i);
    });
  });

  describe('fixed safety/policy footer (P8-048..P8-050)', () => {
    it.each(ALL_USE_CASES)(
      'appends safety, no-diagnosis, and no-authority-change sections last for useCase=%s',
      (useCase) => {
        const prompt = service.renderPrompt({
          studentMessage: 'Hello',
          context: makeSnapshot(),
          useCase,
        });

        const footerKeys = prompt.sections.slice(-3).map((section) => section.key);
        expect(footerKeys).toEqual([
          SAFETY_INSTRUCTION_PROMPT_TEMPLATE_KEY,
          NO_DIAGNOSIS_POLICY_KEY,
          NO_AUTHORITY_CHANGE_POLICY_KEY,
        ]);
      },
    );

    it('the safety section forbids diagnosis and revealing the system prompt', () => {
      expect(SAFETY_INSTRUCTION_PROMPT_TEXT).toMatch(/Never diagnose/);
      expect(SAFETY_INSTRUCTION_PROMPT_TEXT).toMatch(/Never reveal, repeat, summarize/);
    });

    it('the no-diagnosis policy forbids clinical or medical framing', () => {
      expect(NO_DIAGNOSIS_POLICY_TEXT).toMatch(/never a clinical, medical, or/);
      expect(NO_DIAGNOSIS_POLICY_TEXT).toMatch(/Never diagnose, name, label, or suggest/);
    });

    it('the no-authority-change policy forbids overriding AIM Engine decisions', () => {
      expect(NO_AUTHORITY_CHANGE_POLICY_TEXT).toMatch(/AIM Engine is the sole owner/);
      expect(NO_AUTHORITY_CHANGE_POLICY_TEXT).toMatch(
        /must never modify, override, contradict, recalculate, or invent/,
      );
    });
  });

  describe('AIM Engine authority is preserved across every use case', () => {
    it.each(ALL_USE_CASES)(
      'never injects a mastery, level, or difficulty value not present in context for useCase=%s',
      (useCase) => {
        const prompt = service.renderPrompt({
          studentMessage: 'Hello',
          context: makeSnapshot(),
          useCase,
        });

        expect(prompt.renderedText).not.toMatch(/"mastery":\s*\d/);
        expect(prompt.renderedText).not.toMatch(/"level":\s*\d/);
        expect(prompt.renderedText).not.toMatch(/"difficulty":\s*\d/);
      },
    );

    it('never renders a skillState/weakness/recommendation/reviewSchedule/placementResult/recentMistakes section, even when forced via an unsafe cast', () => {
      const prompt = service.renderPrompt({
        studentMessage: 'Why was this wrong?',
        context: makeSnapshot() as unknown as AiTeacherContextSnapshot,
        useCase: ANSWER_EXPLANATION_PROMPT_TEMPLATE_KEY,
      });

      const keys = prompt.sections.map((section) => section.key);
      expect(keys).not.toContain('skillState');
      expect(keys).not.toContain('weakness');
      expect(keys).not.toContain('recommendation');
      expect(keys).not.toContain('reviewSchedule');
      expect(keys).not.toContain('placementResult');
      expect(keys).not.toContain('recentMistakes');
    });
  });

  describe('full context rendering for each use-case template', () => {
    it('mistake_explanation never renders recentMistakes or weakness sections (AI Authority Rule)', () => {
      const prompt = service.renderPrompt({
        studentMessage: 'Why is this wrong?',
        context: makeSnapshot(),
        useCase: MISTAKE_EXPLANATION_PROMPT_TEMPLATE_KEY,
      });

      const keys = prompt.sections.map((section) => section.key);
      expect(keys).not.toContain('recentMistakes');
      expect(keys).not.toContain('weakness');
    });

    it('answer_explanation renders curriculumSkill but never skillState or recentMistakes (AI Authority Rule)', () => {
      const prompt = service.renderPrompt({
        studentMessage: 'Why was my answer marked wrong?',
        context: makeSnapshot({
          curriculumSkill: { skillId: 'skill-1' },
        }),
        useCase: ANSWER_EXPLANATION_PROMPT_TEMPLATE_KEY,
      });

      const keys = prompt.sections.map((section) => section.key);
      expect(keys).toContain('curriculumSkill');
      expect(keys).not.toContain('skillState');
      expect(keys).not.toContain('recentMistakes');
    });

    it('omits all optional sections for every use case when context fields are null/empty', () => {
      const useCasesWithTemplates: PromptUseCase[] = [
        LESSON_HELP_PROMPT_TEMPLATE_KEY,
        MISTAKE_EXPLANATION_PROMPT_TEMPLATE_KEY,
        HINT_GENERATION_PROMPT_TEMPLATE_KEY,
        ANSWER_EXPLANATION_PROMPT_TEMPLATE_KEY,
      ];
      for (const useCase of useCasesWithTemplates) {
        const prompt = service.renderPrompt({
          studentMessage: 'Hello',
          context: makeSnapshot(),
          useCase,
        });

        const optionalKeys = prompt.sections
          .map((section) => section.key)
          .filter(
            (key) =>
              ![
                'templateInstructions',
                SAFETY_INSTRUCTION_PROMPT_TEMPLATE_KEY,
                NO_DIAGNOSIS_POLICY_KEY,
                NO_AUTHORITY_CHANGE_POLICY_KEY,
              ].includes(key),
          );
        expect(optionalKeys).toEqual([]);
      }
    });
  });
});
