// Phase 3 — P3-047
// Lesson request payload validation.
//
// Source of truth: packages/shared-contracts/api/lesson-contracts.md (P3-010).
//
// Note: linking a lesson to skills (the critical "every lesson must be
// linked to one or more skills" rule, P3-006) and lesson assets are handled
// by their own mapping endpoints/DTOs (lesson_skills, lesson_objectives,
// lesson_assets) and are not part of this create/update request.

import { CurriculumErrorCode } from '../validation/curriculum-error-code';
import { CurriculumValidationDetail, CurriculumValidationError } from '../validation/curriculum-validation.error';
import {
  isNonEmptyString,
  isPositiveInteger,
  isUuid,
  rejectClientWritableStatus,
  rejectImmutableField,
} from '../validation/validation-helpers';

export interface CreateLessonRequest {
  chapterId: string;
  title: string;
  description: string;
  order?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  order?: number;
}

export function validateCreateLessonRequest(input: Record<string, unknown>): CreateLessonRequest {
  const issues: CurriculumValidationDetail[] = [];

  if (!isUuid(input.chapterId)) {
    issues.push({ field: 'chapterId', message: 'A valid parent chapterId is required' });
  }

  if (!isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Lesson title is required' });
  }

  if (!isNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Lesson description is required' });
  }

  if (input.order !== undefined && !isPositiveInteger(input.order)) {
    issues.push({ field: 'order', message: 'Lesson order must be a positive integer when provided' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues, 'create'), 'Lesson payload failed validation', issues);
  }

  const result: CreateLessonRequest = {
    chapterId: input.chapterId as string,
    title: (input.title as string).trim(),
    description: (input.description as string).trim(),
  };

  if (input.order !== undefined) {
    result.order = input.order as number;
  }

  return result;
}

export function validateUpdateLessonRequest(input: Record<string, unknown>): UpdateLessonRequest {
  const issues: CurriculumValidationDetail[] = [];

  // chapterId is set on creation only and can never be changed (P3-010, 2.2).
  rejectImmutableField(
    input,
    'chapterId',
    'Lesson chapterId cannot be changed after creation.',
    issues,
  );

  if (input.title !== undefined && !isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Lesson title must be a non-empty string' });
  }

  if (input.description !== undefined && !isNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Lesson description must be a non-empty string' });
  }

  if (input.order !== undefined && !isPositiveInteger(input.order)) {
    issues.push({ field: 'order', message: 'Lesson order must be a positive integer when provided' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues, 'update'), 'Lesson payload failed validation', issues);
  }

  const result: UpdateLessonRequest = {};

  if (input.title !== undefined) result.title = (input.title as string).trim();
  if (input.description !== undefined) result.description = (input.description as string).trim();
  if (input.order !== undefined) result.order = input.order as number;

  return result;
}

function issueCode(
  issues: readonly CurriculumValidationDetail[],
  context: 'create' | 'update',
): CurriculumErrorCode {
  if (issues.some((i) => i.field === 'status')) {
    return CurriculumErrorCode.LESSON_INVALID_STATUS_TRANSITION;
  }
  if (issues.some((i) => i.field === 'chapterId')) {
    return context === 'update'
      ? CurriculumErrorCode.LESSON_CHAPTER_ID_IMMUTABLE
      : CurriculumErrorCode.LESSON_CHAPTER_NOT_FOUND;
  }
  if (issues.some((i) => i.field === 'title')) {
    return CurriculumErrorCode.LESSON_TITLE_REQUIRED;
  }
  if (issues.some((i) => i.field === 'description')) {
    return CurriculumErrorCode.LESSON_DESCRIPTION_REQUIRED;
  }
  if (issues.some((i) => i.field === 'order')) {
    return CurriculumErrorCode.LESSON_ORDER_CONFLICT;
  }
  return CurriculumErrorCode.LESSON_TITLE_REQUIRED;
}
