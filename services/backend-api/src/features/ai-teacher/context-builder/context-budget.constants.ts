/**
 * P8-038: Context Token Budget Policy — priority and budget configuration.
 * Lower `priority` value is kept first. Fields are dropped before being
 * truncated; truncation is only applied to fields explicitly marked
 * `truncatable`. AIM Engine-authoritative fields (skillState, weakness,
 * recommendation, reviewSchedule, placementResult) are never truncated —
 * they are kept whole or dropped entirely to avoid corrupting backend
 * learning-decision data inside the prompt.
 */
import { ContextFieldBudgetRule } from './context-budget.types';

export const AI_TEACHER_CONTEXT_TOTAL_TOKEN_BUDGET = 2000;

export const AI_TEACHER_CONTEXT_FIELD_BUDGET_RULES: readonly ContextFieldBudgetRule[] = [
  { field: 'currentLesson', priority: 1, maxTokens: 300, truncatable: false },
  { field: 'studentProfile', priority: 2, maxTokens: 200, truncatable: false },
  { field: 'skillState', priority: 3, maxTokens: 250, truncatable: false },
  { field: 'weakness', priority: 4, maxTokens: 250, truncatable: false },
  { field: 'curriculumSkill', priority: 5, maxTokens: 250, truncatable: false },
  { field: 'recentMistakes', priority: 6, maxTokens: 400, truncatable: true },
  { field: 'recommendation', priority: 7, maxTokens: 150, truncatable: false },
  { field: 'reviewSchedule', priority: 8, maxTokens: 150, truncatable: false },
  { field: 'placementResult', priority: 9, maxTokens: 150, truncatable: false },
];

export const AI_TEACHER_CONTEXT_CHARS_PER_TOKEN = 4;
