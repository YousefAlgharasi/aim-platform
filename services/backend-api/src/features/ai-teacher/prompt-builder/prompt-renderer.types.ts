/**
 * P8-051: Build Prompt Renderer.
 * Contract for rendering a stable `AiTeacherPrompt` by combining the
 * always-on tutoring behavior template (P8-043), exactly one use-case
 * template (P8-044..P8-047), and the fixed safety/policy footer
 * (P8-048..P8-050) with a budgeted, backend-approved
 * `AiTeacherContextSnapshot` (Group D). The renderer performs no database
 * access, no AI provider call, and computes no learning-decision value;
 * use-case selection is supplied by the caller (Group G — AI Teacher
 * Backend Pipeline), never inferred here.
 */
import { AiTeacherContextSnapshot } from '../context-builder/context-builder.types';
import { LESSON_HELP_PROMPT_TEMPLATE_KEY } from './templates/lesson-help.template';
import { MISTAKE_EXPLANATION_PROMPT_TEMPLATE_KEY } from './templates/mistake-explanation.template';
import { HINT_GENERATION_PROMPT_TEMPLATE_KEY } from './templates/hint-generation.template';
import { ANSWER_EXPLANATION_PROMPT_TEMPLATE_KEY } from './templates/answer-explanation.template';

export const PROMPT_USE_CASE_GENERAL = 'general' as const;

export type PromptUseCase =
  | typeof LESSON_HELP_PROMPT_TEMPLATE_KEY
  | typeof MISTAKE_EXPLANATION_PROMPT_TEMPLATE_KEY
  | typeof HINT_GENERATION_PROMPT_TEMPLATE_KEY
  | typeof ANSWER_EXPLANATION_PROMPT_TEMPLATE_KEY
  | typeof PROMPT_USE_CASE_GENERAL;

export interface RenderPromptInput {
  readonly studentMessage: string;
  readonly context: AiTeacherContextSnapshot;
  readonly useCase: PromptUseCase;
}

export interface RenderedPrompt {
  readonly systemInstructions: string;
  readonly sections: ReadonlyArray<{ readonly key: string; readonly content: string }>;
  readonly studentMessage: string;
  readonly renderedText: string;
}
