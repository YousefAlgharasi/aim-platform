/**
 * P8-038: Context Token Budget Policy — priority and budget configuration.
 * Lower `priority` value is kept first. Fields are dropped before being
 * truncated; truncation is only applied to fields explicitly marked
 * `truncatable`.
 *
 * P18-031: Removed budget rules for skillState/weakness/recommendation/
 * reviewSchedule/placementResult/recentMistakes — those fields no longer
 * exist on AiTeacherContextSnapshot per the AI Authority Rule.
 */
import { ContextFieldBudgetRule } from './context-budget.types';

export const AI_TEACHER_CONTEXT_TOTAL_TOKEN_BUDGET = 2000;

export const AI_TEACHER_CONTEXT_FIELD_BUDGET_RULES: readonly ContextFieldBudgetRule[] = [
  { field: 'currentLesson', priority: 1, maxTokens: 300, truncatable: false },
  { field: 'studentProfile', priority: 2, maxTokens: 200, truncatable: false },
  { field: 'curriculumSkill', priority: 3, maxTokens: 250, truncatable: false },
];

export const AI_TEACHER_CONTEXT_CHARS_PER_TOKEN = 4;
