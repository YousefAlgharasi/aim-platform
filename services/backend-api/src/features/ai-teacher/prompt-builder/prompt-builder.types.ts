/**
 * P8-041: AI Teacher Prompt Builder Skeleton.
 * Contract for turning a budgeted, backend-approved AiTeacherContextSnapshot
 * plus the student's chat message into a structured, safe prompt payload
 * for the AI Provider Gateway (Group F). This module never calls an AI
 * provider, never reads the database, and never computes mastery, level,
 * weakness, difficulty, recommendation, or review-schedule values — those
 * remain exclusively owned by AIM Engine. Section content is filled in by
 * later Phase 8 tasks (P8-042..P8-049); this skeleton defines the contract
 * and assembly order only.
 */
import { AiTeacherContextSnapshot } from '../context-builder/context-builder.types';

/**
 * Mirrors LessonTeachingStageService's LessonTeachingStage — defined
 * locally (not imported from orchestrator/) so prompt-builder never
 * depends on the orchestrator module, keeping the existing Group
 * E-depends-on-D-only layering intact.
 */
export type PromptLessonStage = 'greeting' | 'teaching' | 'complete';

export interface PromptHistoryTurn {
  readonly role: 'student' | 'ai_teacher';
  readonly text: string;
}

export interface BuildPromptInput {
  readonly studentMessage: string;
  readonly context: AiTeacherContextSnapshot;

  /**
   * The session's backend-enforced lesson-delivery stage. Drives which
   * system instructions are used (greeting vs. teaching vs. complete) —
   * see prompt-builder.constants.ts. Defaults to 'teaching' when omitted
   * (e.g. general chat with no lesson-delivery flow).
   */
  readonly lessonStage?: PromptLessonStage;

  /**
   * Recent prior turns in this session (oldest first), so the AI Teacher
   * has memory of what it already taught/asked instead of generating each
   * reply in isolation. Rendered as a transcript section, never persisted
   * or computed here — the caller (orchestrator) fetches it read-only from
   * AiChatMessageRepository.
   */
  readonly history?: readonly PromptHistoryTurn[];
}

export interface PromptSection {
  readonly key: string;
  readonly content: string;
}

export interface AiTeacherPrompt {
  readonly systemInstructions: string;
  readonly sections: PromptSection[];
  readonly studentMessage: string;
}
