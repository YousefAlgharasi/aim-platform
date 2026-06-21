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

export interface BuildPromptInput {
  readonly studentMessage: string;
  readonly context: AiTeacherContextSnapshot;
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
