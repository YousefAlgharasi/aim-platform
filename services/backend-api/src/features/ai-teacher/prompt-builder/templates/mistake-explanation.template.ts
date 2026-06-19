/**
 * P8-045: Mistake Explanation Prompt Template.
 * Prompt template for the "explain my mistake" use case: the student asks
 * AI Teacher why an answer was wrong or to explain a recurring error
 * pattern. This template only renders backend-approved, already-resolved
 * context (recentMistakes, weakness) from AiTeacherContextSnapshot
 * (P8-034, P8-037); it computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value and never overrides AIM Engine
 * authority (docs/phase-8/no-aim-replacement-rule.md). Wiring this
 * template into the prompt renderer's template selection is done by
 * P8-051 (Build Prompt Renderer); this task only defines the template
 * itself.
 */
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { PromptSection } from '../prompt-builder.types';

export const MISTAKE_EXPLANATION_PROMPT_TEMPLATE_KEY = 'mistake_explanation';

export const MISTAKE_EXPLANATION_PROMPT_INSTRUCTIONS = [
  'The student is asking why an answer was wrong or wants their mistake',
  'explained.',
  'Use only the recent mistake patterns and weakness context below to',
  'explain the error in simple, encouraging terms appropriate for an A1',
  'learner.',
  'Do not reveal a correct answer the student has not already submitted',
  'unless it is already present in the provided context.',
  'Do not state or imply a mastery, level, weakness, difficulty,',
  'recommendation, or review-schedule value beyond what is already given',
  'in the context; those belong to AIM Engine.',
  'If no recent mistake context is available, ask the student which',
  'question or answer they want explained instead of guessing.',
].join(' ');

export function buildMistakeExplanationPromptSections(
  context: AiTeacherContextSnapshot,
): PromptSection[] {
  const sections: PromptSection[] = [
    { key: 'templateInstructions', content: MISTAKE_EXPLANATION_PROMPT_INSTRUCTIONS },
  ];

  if (context.recentMistakes && context.recentMistakes.length > 0) {
    sections.push({
      key: 'recentMistakes',
      content: JSON.stringify(context.recentMistakes),
    });
  }

  if (context.weakness) {
    sections.push({
      key: 'weakness',
      content: JSON.stringify(context.weakness),
    });
  }

  return sections;
}
