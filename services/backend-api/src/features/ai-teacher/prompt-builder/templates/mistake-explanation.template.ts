/**
 * P8-045: Mistake Explanation Prompt Template.
 * Prompt template for the "explain my mistake" use case: the student asks
 * AI Teacher why an answer was wrong or to explain a recurring error
 * pattern. It computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value and never overrides AIM Engine
 * authority (docs/phase-8/no-aim-replacement-rule.md).
 *
 * P18-031: Removed the recentMistakes and weakness sections. The Phase 18
 * AI Authority Rule forbids AI Teacher from reading assessment-derived
 * mistake patterns or weakness data — those values are owned exclusively
 * by the AIM Engine. This template now relies on the student's own message
 * content (passed separately by the prompt builder) to identify which
 * mistake they're asking about.
 */
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { PromptSection } from '../prompt-builder.types';

export const MISTAKE_EXPLANATION_PROMPT_TEMPLATE_KEY = 'mistake_explanation';

export const MISTAKE_EXPLANATION_PROMPT_INSTRUCTIONS = [
  'The student is asking why an answer was wrong or wants their mistake',
  'explained.',
  'Use only the student’s own message and any backend-approved feedback',
  'already present in the conversation to explain the error in simple,',
  'encouraging terms appropriate for an A1 learner.',
  'Do not reveal a correct answer the student has not already submitted',
  'unless it is already present in the provided context.',
  'Do not state or imply a mastery, level, weakness, difficulty,',
  'recommendation, or review-schedule value — those belong to AIM Engine',
  'and are never provided to you.',
  'If you cannot tell which question or answer the student means, ask',
  'them to specify instead of guessing.',
].join(' ');

export function buildMistakeExplanationPromptSections(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: AiTeacherContextSnapshot,
): PromptSection[] {
  return [{ key: 'templateInstructions', content: MISTAKE_EXPLANATION_PROMPT_INSTRUCTIONS }];
}
