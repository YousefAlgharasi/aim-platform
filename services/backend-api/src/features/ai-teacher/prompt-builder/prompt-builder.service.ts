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
  buildLessonStageInstructions,
  buildStudentIdentityInstructions,
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

    const historySection = this.buildHistorySection(input.history);
    if (historySection) {
      sections.push(historySection);
    }

    const systemInstructions = [
      buildStudentIdentityInstructions(),
      buildLessonStageInstructions(input.lessonStage),
    ].join(' ');

    return {
      systemInstructions,
      sections,
      studentMessage: input.studentMessage,
    };
  }

  /**
   * Renders recent prior turns (BuildPromptInput.history, already fetched
   * read-only by the orchestrator) as a single transcript section so the
   * model has memory of what it already taught/asked. Returns null when
   * there is no history yet (a session's very first real turn), matching
   * every other optional section's null-omits-the-section behavior.
   */
  private buildHistorySection(history: BuildPromptInput['history']): PromptSection | null {
    if (!history || history.length === 0) {
      return null;
    }

    const transcript = history
      .map((turn) => `${turn.role === 'student' ? 'Student' : 'AI Teacher'}: ${turn.text}`)
      .join('\n');

    return { key: 'conversationHistory', content: transcript };
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
