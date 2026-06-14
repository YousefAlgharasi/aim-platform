// Phase 3 — P3-047
// Course request payload validation.
//
// Source of truth: packages/shared-contracts/api/curriculum-hierarchy-contracts.md
// (Create/Update Course Request, P3-009).

import { CurriculumErrorCode } from '../validation/curriculum-error-code';
import { CurriculumValidationDetail, CurriculumValidationError } from '../validation/curriculum-validation.error';
import {
  isInteger,
  isNonEmptyString,
  isOptionalNonEmptyString,
  rejectClientWritableStatus,
} from '../validation/validation-helpers';

export interface CreateCourseRequest {
  title: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number | null;
}

export interface UpdateCourseRequest {
  title?: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number;
}

export function validateCreateCourseRequest(input: Record<string, unknown>): CreateCourseRequest {
  const issues: CurriculumValidationDetail[] = [];

  if (!isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Course title is required' });
  }

  if (!isOptionalNonEmptyString(input.slug)) {
    issues.push({ field: 'slug', message: 'Course slug must be a non-empty string when provided' });
  }

  if (!isOptionalNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Course description must be a non-empty string when provided' });
  }

  if (input.sortOrder !== undefined && input.sortOrder !== null && !isInteger(input.sortOrder)) {
    issues.push({ field: 'sortOrder', message: 'Course sortOrder must be an integer when provided' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(
      issueCode(issues),
      'Course payload failed validation',
      issues,
    );
  }

  return {
    title: (input.title as string).trim(),
    slug: (input.slug as string | null | undefined) ?? null,
    description: (input.description as string | null | undefined) ?? null,
    sortOrder: (input.sortOrder as number | null | undefined) ?? null,
  };
}

export function validateUpdateCourseRequest(input: Record<string, unknown>): UpdateCourseRequest {
  const issues: CurriculumValidationDetail[] = [];

  if (input.title !== undefined && !isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Course title must be a non-empty string' });
  }

  if (!isOptionalNonEmptyString(input.slug)) {
    issues.push({ field: 'slug', message: 'Course slug must be a non-empty string when provided' });
  }

  if (!isOptionalNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Course description must be a non-empty string when provided' });
  }

  if (input.sortOrder !== undefined && !isInteger(input.sortOrder)) {
    issues.push({ field: 'sortOrder', message: 'Course sortOrder must be an integer when provided' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(
      issueCode(issues),
      'Course payload failed validation',
      issues,
    );
  }

  const result: UpdateCourseRequest = {};

  if (input.title !== undefined) result.title = (input.title as string).trim();
  if (input.slug !== undefined) result.slug = input.slug as string | null;
  if (input.description !== undefined) result.description = input.description as string | null;
  if (input.sortOrder !== undefined) result.sortOrder = input.sortOrder as number;

  return result;
}

/**
 * Picks the most relevant error code for the top-level error when multiple
 * field issues are present. Falls back to COURSE_TITLE_REQUIRED, the most
 * common validation failure, when no field-specific match is found.
 */
function issueCode(issues: readonly CurriculumValidationDetail[]): CurriculumErrorCode {
  if (issues.some((i) => i.field === 'status')) {
    return CurriculumErrorCode.COURSE_INVALID_STATUS_TRANSITION;
  }
  if (issues.some((i) => i.field === 'title')) {
    return CurriculumErrorCode.COURSE_TITLE_REQUIRED;
  }
  if (issues.some((i) => i.field === 'description')) {
    return CurriculumErrorCode.COURSE_DESCRIPTION_REQUIRED;
  }
  return CurriculumErrorCode.COURSE_TITLE_REQUIRED;
}
