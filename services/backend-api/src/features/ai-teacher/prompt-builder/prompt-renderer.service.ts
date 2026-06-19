/**
 * P8-051: Build Prompt Renderer.
 * Renders a stable, final `RenderedPrompt` by combining the fixed system
 * instructions (P8-042), the always-on tutoring behavior template
 * (P8-043), the selected use-case template (P8-044..P8-047), and the
 * fixed safety/policy footer (P8-048..P8-050) with a budgeted,
 * backend-approved `AiTeacherContextSnapshot` (Group D). This service
 * performs no database access, no AI provider call, and computes no
 * mastery/level/weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md). Sending the rendered prompt
 * to an AI provider is owned exclusively by the AI Provider Gateway
 * (Group F), never by this service or by Flutter
 * (docs/phase-8/no-client-ai-provider-rule.md).
 */
import { Injectable, Logger } from '@nestjs/common';

import { AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS } from './prompt-builder.constants';
import { buildRenderedPromptSections } from './prompt-renderer.constants';
import { RenderedPrompt, RenderPromptInput } from './prompt-renderer.types';

@Injectable()
export class PromptRendererService {
  private readonly logger = new Logger(PromptRendererService.name);

  renderPrompt(input: RenderPromptInput): RenderedPrompt {
    this.logger.log(
      `Rendering AI Teacher prompt for session ${input.context.sessionId} (useCase=${input.useCase})`,
    );

    const sections = buildRenderedPromptSections(input.useCase, input.context);

    const renderedText = [
      AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS,
      ...sections.map((section) => `[${section.key}]\n${section.content}`),
      `Student: ${input.studentMessage}`,
    ].join('\n\n');

    return {
      systemInstructions: AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS,
      sections,
      studentMessage: input.studentMessage,
      renderedText,
    };
  }
}
