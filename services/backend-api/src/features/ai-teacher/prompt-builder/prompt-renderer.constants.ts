/**
 * P8-051: Build Prompt Renderer — constants.
 * Fixed assembly order for a rendered prompt: the always-on tutoring
 * behavior template (P8-043) first, then the selected use-case template
 * (P8-044..P8-047) if any, then the fixed safety/policy footer
 * (P8-048..P8-050) last so it stays closest to the student message. This
 * order is stable and must not be changed per request.
 */
import { AiTeacherContextSnapshot } from '../context-builder/context-builder.types';
import { PromptSection } from './prompt-builder.types';
import {
  buildTutoringBehaviorPromptSections,
} from './templates/tutoring-behavior.template';
import {
  LESSON_HELP_PROMPT_TEMPLATE_KEY,
  buildLessonHelpPromptSections,
} from './templates/lesson-help.template';
import {
  MISTAKE_EXPLANATION_PROMPT_TEMPLATE_KEY,
  buildMistakeExplanationPromptSections,
} from './templates/mistake-explanation.template';
import {
  HINT_GENERATION_PROMPT_TEMPLATE_KEY,
  buildHintGenerationPromptSections,
} from './templates/hint-generation.template';
import {
  ANSWER_EXPLANATION_PROMPT_TEMPLATE_KEY,
  buildAnswerExplanationPromptSections,
} from './templates/answer-explanation.template';
import { buildSafetyInstructionPromptSection } from './templates/safety-instruction.template';
import { buildNoDiagnosisPolicySection } from './policies/no-diagnosis.policy';
import { buildNoAuthorityChangePolicySection } from './policies/no-authority-change.policy';
import { PROMPT_USE_CASE_GENERAL, PromptUseCase } from './prompt-renderer.types';

export const PROMPT_USE_CASE_TEMPLATE_BUILDERS: Readonly<
  Record<
    Exclude<PromptUseCase, typeof PROMPT_USE_CASE_GENERAL>,
    (context: AiTeacherContextSnapshot) => PromptSection[]
  >
> = {
  [LESSON_HELP_PROMPT_TEMPLATE_KEY]: buildLessonHelpPromptSections,
  [MISTAKE_EXPLANATION_PROMPT_TEMPLATE_KEY]: buildMistakeExplanationPromptSections,
  [HINT_GENERATION_PROMPT_TEMPLATE_KEY]: buildHintGenerationPromptSections,
  [ANSWER_EXPLANATION_PROMPT_TEMPLATE_KEY]: buildAnswerExplanationPromptSections,
};

export function buildRenderedPromptSections(
  useCase: PromptUseCase,
  context: AiTeacherContextSnapshot,
): PromptSection[] {
  const sections: PromptSection[] = [...buildTutoringBehaviorPromptSections(context)];

  if (useCase !== PROMPT_USE_CASE_GENERAL) {
    sections.push(...PROMPT_USE_CASE_TEMPLATE_BUILDERS[useCase](context));
  }

  sections.push(
    buildSafetyInstructionPromptSection(),
    buildNoDiagnosisPolicySection(),
    buildNoAuthorityChangePolicySection(),
  );

  return sections;
}
