// Phase 3 — P3-047
// Question Bank item and answer-choice request payload validation.
//
// Source of truth: packages/shared-contracts/api/question-bank-contracts.md (P3-014).
//
// Scope notes:
// - Publish requirements (non-empty stem, valid answer defined, published
//   primary skill mapping — content-status-contracts.md Section 5) are
//   validated by the publish-validation/service layer, not here.
// - `type` is set on creation only and rejected on update (QUESTION_TYPE_IMMUTABLE).
// - `validateQuestionChoiceSet` implements the per-type choice-count rules
//   from P3-014 Section 5.2 and can be called by the service layer once all
//   choices for a question are known.

import { CurriculumErrorCode } from '../validation/curriculum-error-code';
import { CurriculumValidationDetail, CurriculumValidationError } from '../validation/curriculum-validation.error';
import {
  isBoolean,
  isNonEmptyString,
  isOptionalNonEmptyString,
  isPositiveInteger,
  isStringArray,
  isUuid,
  rejectClientWritableStatus,
  rejectImmutableField,
} from '../validation/validation-helpers';

export const QUESTION_TYPES = [
  'multiple_choice',
  'multiple_select',
  'true_false',
  'fill_in_the_blank',
  'short_answer',
  'ordering',
  'matching',
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export function isQuestionType(value: unknown): value is QuestionType {
  return typeof value === 'string' && (QUESTION_TYPES as readonly string[]).includes(value);
}

export const QUESTION_DIFFICULTIES = [
  'beginner',
  'elementary',
  'intermediate',
  'upper_intermediate',
  'advanced',
] as const;

export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

export function isQuestionDifficulty(value: unknown): value is QuestionDifficulty {
  return typeof value === 'string' && (QUESTION_DIFFICULTIES as readonly string[]).includes(value);
}

// Choice types that use `is_correct`-bearing choices at all.
const CHOICE_BASED_TYPES: readonly QuestionType[] = [
  'multiple_choice',
  'multiple_select',
  'true_false',
  'ordering',
  'matching',
];

export interface CreateQuestionRequest {
  type: QuestionType;
  stem: string;
  richStem?: Record<string, unknown> | null;
  difficulty: QuestionDifficulty;
  explanation?: string | null;
  hint?: string | null;
  tags?: string[];
}

export interface UpdateQuestionRequest {
  stem?: string;
  richStem?: Record<string, unknown> | null;
  difficulty?: QuestionDifficulty;
  explanation?: string | null;
  hint?: string | null;
  tags?: string[];
}

export function validateCreateQuestionRequest(input: Record<string, unknown>): CreateQuestionRequest {
  const issues: CurriculumValidationDetail[] = [];

  if (!isQuestionType(input.type)) {
    issues.push({ field: 'type', message: `Question type must be one of: ${QUESTION_TYPES.join(', ')}` });
  }

  if (!isNonEmptyString(input.stem)) {
    issues.push({ field: 'stem', message: 'Question stem is required' });
  }

  if (!isQuestionDifficulty(input.difficulty)) {
    issues.push({ field: 'difficulty', message: `Question difficulty must be one of: ${QUESTION_DIFFICULTIES.join(', ')}` });
  }

  validateOptionalQuestionFields(input, issues);

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues, 'create'), 'Question payload failed validation', issues);
  }

  const result: CreateQuestionRequest = {
    type: input.type as QuestionType,
    stem: (input.stem as string).trim(),
    difficulty: input.difficulty as QuestionDifficulty,
  };

  if (input.richStem !== undefined) result.richStem = input.richStem as Record<string, unknown> | null;
  if (input.explanation !== undefined) result.explanation = input.explanation as string | null;
  if (input.hint !== undefined) result.hint = input.hint as string | null;
  if (input.tags !== undefined) result.tags = input.tags as string[];

  return result;
}

export function validateUpdateQuestionRequest(input: Record<string, unknown>): UpdateQuestionRequest {
  const issues: CurriculumValidationDetail[] = [];

  // `type` is set on creation only (P3-014, 4.2).
  rejectImmutableField(input, 'type', 'Question type cannot be changed after creation.', issues);

  if (input.stem !== undefined && !isNonEmptyString(input.stem)) {
    issues.push({ field: 'stem', message: 'Question stem must be a non-empty string' });
  }

  if (input.difficulty !== undefined && !isQuestionDifficulty(input.difficulty)) {
    issues.push({ field: 'difficulty', message: `Question difficulty must be one of: ${QUESTION_DIFFICULTIES.join(', ')}` });
  }

  validateOptionalQuestionFields(input, issues);

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues, 'update'), 'Question payload failed validation', issues);
  }

  const result: UpdateQuestionRequest = {};

  if (input.stem !== undefined) result.stem = (input.stem as string).trim();
  if (input.richStem !== undefined) result.richStem = input.richStem as Record<string, unknown> | null;
  if (input.difficulty !== undefined) result.difficulty = input.difficulty as QuestionDifficulty;
  if (input.explanation !== undefined) result.explanation = input.explanation as string | null;
  if (input.hint !== undefined) result.hint = input.hint as string | null;
  if (input.tags !== undefined) result.tags = input.tags as string[];

  return result;
}

function validateOptionalQuestionFields(
  input: Record<string, unknown>,
  issues: CurriculumValidationDetail[],
): void {
  if (!isOptionalNonEmptyString(input.explanation)) {
    issues.push({ field: 'explanation', message: 'Question explanation must be a non-empty string when provided' });
  }

  if (!isOptionalNonEmptyString(input.hint)) {
    issues.push({ field: 'hint', message: 'Question hint must be a non-empty string when provided' });
  }

  if (input.tags !== undefined && !isStringArray(input.tags)) {
    issues.push({ field: 'tags', message: 'Question tags must be an array of strings when provided' });
  }

  if (
    input.richStem !== undefined &&
    input.richStem !== null &&
    (typeof input.richStem !== 'object' || Array.isArray(input.richStem))
  ) {
    issues.push({ field: 'richStem', message: 'Question richStem must be an object when provided' });
  }
}

function issueCode(
  issues: readonly CurriculumValidationDetail[],
  context: 'create' | 'update',
): CurriculumErrorCode {
  if (issues.some((i) => i.field === 'status')) {
    return CurriculumErrorCode.QUESTION_INVALID_STATUS_TRANSITION;
  }
  if (issues.some((i) => i.field === 'type')) {
    return context === 'update' ? CurriculumErrorCode.QUESTION_TYPE_IMMUTABLE : CurriculumErrorCode.QUESTION_INVALID_TYPE;
  }
  if (issues.some((i) => i.field === 'stem')) {
    return CurriculumErrorCode.QUESTION_MISSING_STEM;
  }
  if (issues.some((i) => i.field === 'difficulty')) {
    return CurriculumErrorCode.QUESTION_INVALID_DIFFICULTY;
  }
  return CurriculumErrorCode.QUESTION_MISSING_STEM;
}

// ---------------------------------------------------------------------------
// Answer choices (P3-014, Section 5)
// ---------------------------------------------------------------------------

export interface CreateQuestionChoiceRequest {
  questionId: string;
  text: string;
  richText?: Record<string, unknown> | null;
  isCorrect: boolean;
  order: number;
  explanation?: string | null;
}

export interface UpdateQuestionChoiceRequest {
  text?: string;
  richText?: Record<string, unknown> | null;
  isCorrect?: boolean;
  order?: number;
  explanation?: string | null;
}

export function validateCreateQuestionChoiceRequest(input: Record<string, unknown>): CreateQuestionChoiceRequest {
  const issues: CurriculumValidationDetail[] = [];

  if (!isUuid(input.questionId)) {
    issues.push({ field: 'questionId', message: 'A valid parent questionId is required' });
  }

  if (!isNonEmptyString(input.text)) {
    issues.push({ field: 'text', message: 'Choice text is required' });
  }

  if (!isBoolean(input.isCorrect)) {
    issues.push({ field: 'isCorrect', message: 'Choice isCorrect must be a boolean' });
  }

  if (!isPositiveInteger(input.order)) {
    issues.push({ field: 'order', message: 'Choice order must be a positive integer' });
  }

  if (!isOptionalNonEmptyString(input.explanation)) {
    issues.push({ field: 'explanation', message: 'Choice explanation must be a non-empty string when provided' });
  }

  if (issues.length > 0) {
    throw new CurriculumValidationError(choiceIssueCode(issues, 'create'), 'Question choice payload failed validation', issues);
  }

  const result: CreateQuestionChoiceRequest = {
    questionId: input.questionId as string,
    text: (input.text as string).trim(),
    isCorrect: input.isCorrect as boolean,
    order: input.order as number,
  };

  if (input.richText !== undefined) result.richText = input.richText as Record<string, unknown> | null;
  if (input.explanation !== undefined) result.explanation = input.explanation as string | null;

  return result;
}

export function validateUpdateQuestionChoiceRequest(input: Record<string, unknown>): UpdateQuestionChoiceRequest {
  const issues: CurriculumValidationDetail[] = [];

  // questionId is set on creation only (P3-014, 5.2).
  rejectImmutableField(input, 'questionId', 'Choice questionId cannot be changed after creation.', issues);

  if (input.text !== undefined && !isNonEmptyString(input.text)) {
    issues.push({ field: 'text', message: 'Choice text must be a non-empty string' });
  }

  if (input.isCorrect !== undefined && !isBoolean(input.isCorrect)) {
    issues.push({ field: 'isCorrect', message: 'Choice isCorrect must be a boolean' });
  }

  if (input.order !== undefined && !isPositiveInteger(input.order)) {
    issues.push({ field: 'order', message: 'Choice order must be a positive integer' });
  }

  if (!isOptionalNonEmptyString(input.explanation)) {
    issues.push({ field: 'explanation', message: 'Choice explanation must be a non-empty string when provided' });
  }

  if (issues.length > 0) {
    throw new CurriculumValidationError(choiceIssueCode(issues, 'update'), 'Question choice payload failed validation', issues);
  }

  const result: UpdateQuestionChoiceRequest = {};

  if (input.text !== undefined) result.text = (input.text as string).trim();
  if (input.richText !== undefined) result.richText = input.richText as Record<string, unknown> | null;
  if (input.isCorrect !== undefined) result.isCorrect = input.isCorrect as boolean;
  if (input.order !== undefined) result.order = input.order as number;
  if (input.explanation !== undefined) result.explanation = input.explanation as string | null;

  return result;
}

function choiceIssueCode(
  issues: readonly CurriculumValidationDetail[],
  context: 'create' | 'update',
): CurriculumErrorCode {
  if (issues.some((i) => i.field === 'questionId')) {
    return context === 'update' ? CurriculumErrorCode.QUESTION_ANSWER_TYPE_MISMATCH : CurriculumErrorCode.QUESTION_NOT_FOUND;
  }
  if (issues.some((i) => i.field === 'order')) {
    return CurriculumErrorCode.QUESTION_CHOICE_ORDER_CONFLICT;
  }
  return CurriculumErrorCode.QUESTION_MISSING_STEM;
}

/**
 * Validates the full set of choices for a question against the per-type
 * rules in P3-014 Section 5.2. Intended for use by the service layer once
 * all choices for a question (existing + incoming) are known.
 */
export function validateQuestionChoiceSet(
  type: QuestionType,
  choices: readonly { isCorrect: boolean }[],
): void {
  if (!CHOICE_BASED_TYPES.includes(type)) {
    // short_answer and fill_in_the_blank do not use the choices table.
    return;
  }

  const correctCount = choices.filter((c) => c.isCorrect).length;

  switch (type) {
    case 'multiple_choice':
      if (correctCount !== 1) {
        throw new CurriculumValidationError(
          CurriculumErrorCode.QUESTION_CHOICE_CONFLICT,
          'Multiple choices marked correct',
          [{ field: 'choices', message: 'Exactly one choice must be marked correct for multiple_choice questions' }],
        );
      }
      break;

    case 'multiple_select':
      if (correctCount < 1) {
        throw new CurriculumValidationError(
          CurriculumErrorCode.QUESTION_NO_CORRECT_ANSWER,
          'Question must have a correct answer',
          [{ field: 'choices', message: 'At least one choice must be marked correct for multiple_select questions' }],
        );
      }
      break;

    case 'true_false':
      if (choices.length !== 2 || correctCount !== 1) {
        throw new CurriculumValidationError(
          CurriculumErrorCode.QUESTION_TRUE_FALSE_INVALID,
          'True/false question is invalid',
          [{ field: 'choices', message: 'true_false questions must have exactly two choices, one marked correct' }],
        );
      }
      break;

    case 'ordering':
    case 'matching':
      // No is_correct flag is used; correct order/pairings are defined by
      // separate answer records (P3-014 Section 6), validated elsewhere.
      break;
  }
}
