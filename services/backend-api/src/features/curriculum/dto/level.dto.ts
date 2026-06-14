// Phase 3 — P3-047
// Level request payload validation.
//
// Source of truth: packages/shared-contracts/api/curriculum-hierarchy-contracts.md
// (Create/Update Level Request, P3-009).

import { CurriculumErrorCode } from '../validation/curriculum-error-code';
import { CurriculumValidationDetail, CurriculumValidationError } from '../validation/curriculum-validation.error';
import {
  isInteger,
  isNonEmptyString,
  isOptionalNonEmptyString,
  isUuid,
  rejectClientWritableStatus,
  rejectImmutableField,
} from '../validation/validation-helpers';

export interface CreateLevelRequest {
  courseId: string;
  title: string;
  code?: string | null;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number | null;
}

export interface UpdateLevelRequest {
  title?: string;
  code?: string | null;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number;
}

export function validateCreateLevelRequest(input: Record<string, unknown>): CreateLevelRequest {
  const issues: CurriculumValidationDetail[] = [];

  if (!isUuid(input.courseId)) {
    issues.push({ field: 'courseId', message: 'A valid parent courseId is required' });
  }

  if (!isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Level title is required' });
  }

  if (!isOptionalNonEmptyString(input.code)) {
    issues.push({ field: 'code', message: 'Level code must be a non-empty string when provided' });
  }

  if (!isOptionalNonEmptyString(input.slug)) {
    issues.push({ field: 'slug', message: 'Level slug must be a non-empty string when provided' });
  }

  if (!isOptionalNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Level description must be a non-empty string when provided' });
  }

  if (input.sortOrder !== undefined && input.sortOrder !== null && !isInteger(input.sortOrder)) {
    issues.push({ field: 'sortOrder', message: 'Level sortOrder must be an integer when provided' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues), 'Level payload failed validation', issues);
  }

  return {
    courseId: input.courseId as string,
    title: (input.title as string).trim(),
    code: (input.code as string | null | undefined) ?? null,
    slug: (input.slug as string | null | undefined) ?? null,
    description: (input.description as string | null | undefined) ?? null,
    sortOrder: (input.sortOrder as number | null | undefined) ?? null,
  };
}

export function validateUpdateLevelRequest(input: Record<string, unknown>): UpdateLevelRequest {
  const issues: CurriculumValidationDetail[] = [];

  // courseId is set on creation only; moving a level to a different course
  // requires a separate, explicit operation (see curriculum-hierarchy-contracts.md).
  rejectImmutableField(
    input,
    'courseId',
    'Level courseId cannot be changed with this request. Use a dedicated move operation.',
    issues,
  );

  if (input.title !== undefined && !isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Level title must be a non-empty string' });
  }

  if (!isOptionalNonEmptyString(input.code)) {
    issues.push({ field: 'code', message: 'Level code must be a non-empty string when provided' });
  }

  if (!isOptionalNonEmptyString(input.slug)) {
    issues.push({ field: 'slug', message: 'Level slug must be a non-empty string when provided' });
  }

  if (!isOptionalNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Level description must be a non-empty string when provided' });
  }

  if (input.sortOrder !== undefined && !isInteger(input.sortOrder)) {
    issues.push({ field: 'sortOrder', message: 'Level sortOrder must be an integer when provided' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues), 'Level payload failed validation', issues);
  }

  const result: UpdateLevelRequest = {};

  if (input.title !== undefined) result.title = (input.title as string).trim();
  if (input.code !== undefined) result.code = input.code as string | null;
  if (input.slug !== undefined) result.slug = input.slug as string | null;
  if (input.description !== undefined) result.description = input.description as string | null;
  if (input.sortOrder !== undefined) result.sortOrder = input.sortOrder as number;

  return result;
}

function issueCode(issues: readonly CurriculumValidationDetail[]): CurriculumErrorCode {
  if (issues.some((i) => i.field === 'status')) {
    return CurriculumErrorCode.LEVEL_INVALID_STATUS_TRANSITION;
  }
  if (issues.some((i) => i.field === 'courseId')) {
    return CurriculumErrorCode.LEVEL_COURSE_NOT_FOUND;
  }
  if (issues.some((i) => i.field === 'title')) {
    return CurriculumErrorCode.LEVEL_TITLE_REQUIRED;
  }
  return CurriculumErrorCode.LEVEL_TITLE_REQUIRED;
}
