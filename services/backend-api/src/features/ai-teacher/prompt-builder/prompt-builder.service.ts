/**
 * P8-041: AI Teacher Prompt Builder Skeleton (Group E).
 * Assembles a structured AiTeacherPrompt from a budgeted
 * AiTeacherContextSnapshot (Group D) and the student's chat message. This
 * service performs no database access, no AI provider call, and computes
 * no learning-decision value. Section rendering for each context field is
 * filled in by later tasks (P8-042..P8-049); this skeleton only defines
 * assembly order and the fixed system instructions.
 */
import { Injectable, Logger } from '@nestjs/common';

import { AiTeacherContextSnapshot } from '../context-builder/context-builder.types';
import {
  AI_TEACHER_PROMPT_SECTION_ORDER,
  AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS,
} from './prompt-builder.constants';
import { AiTeacherPrompt, BuildPromptInput, PromptSection } from './prompt-builder.types';

@Injectable()
export class PromptBuilderService {
  private readonly logger = new Logger(PromptBuilderService.name);

  buildPrompt(input: BuildPromptInput): AiTeacherPrompt {
    this.logger.log(`Building AI Teacher prompt for session ${input.context.sessionId}`);

    const sections = AI_TEACHER_PROMPT_SECTION_ORDER.map((key) =>
      this.buildSection(key, input.context),
    ).filter((section): section is PromptSection => section !== null);

    return {
      systemInstructions: AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS,
      sections,
      studentMessage: input.studentMessage,
    };
  }

  private buildSection(
    key: (typeof AI_TEACHER_PROMPT_SECTION_ORDER)[number],
    context: AiTeacherContextSnapshot,
  ): PromptSection | null {
    const value = context[key];

    if (value === null || value === undefined) {
      return null;
    }
    if (Array.isArray(value) && value.length === 0) {
      return null;
    }

    return {
      key,
      content: JSON.stringify(value),
    };
  }
}
