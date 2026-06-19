/**
 * P8-038: Context Token Budget Policy.
 * Defines field priority order and trimming contract applied to an
 * AiTeacherContextSnapshot before prompt construction (Group E). This
 * module never mutates learning-decision values; it only controls which
 * backend-approved, already-resolved context fields are kept, dropped, or
 * truncated when the assembled context would exceed the configured token
 * budget (docs/phase-8/context-sources.md).
 */
import { AiTeacherContextSnapshot } from './context-builder.types';

export type ContextFieldKey = Exclude<
  keyof AiTeacherContextSnapshot,
  'studentId' | 'sessionId'
>;

export interface ContextFieldBudgetRule {
  readonly field: ContextFieldKey;
  readonly priority: number;
  readonly maxTokens: number;
  readonly truncatable: boolean;
}

export interface ContextFieldUsage {
  readonly field: ContextFieldKey;
  readonly estimatedTokens: number;
  readonly includedTokens: number;
  readonly truncated: boolean;
  readonly dropped: boolean;
}

export interface BudgetedContextResult {
  readonly snapshot: AiTeacherContextSnapshot;
  readonly totalBudgetTokens: number;
  readonly totalUsedTokens: number;
  readonly fieldUsage: ContextFieldUsage[];
}
