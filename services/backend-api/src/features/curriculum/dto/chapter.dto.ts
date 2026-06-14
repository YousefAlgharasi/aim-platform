// Phase 3 — P3-047
// Chapter request payload validation.
//
// Source of truth: packages/shared-contracts/api/curriculum-hierarchy-contracts.md
// (Create/Update Chapter Request, P3-009).

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

export interface CreateChapterRequest {
  levelId: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number | null;
}

export interface UpdateChapterRequest {
  title?: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number;
}

export function validateCreateChapterRequest(input: Record<string, unknown>): CreateChapterRequest {
  const issues: CurriculumValidationDetail[] = [];

  if (!isUuid(input.levelId)) {
    issues.push({ field: 'levelId', message: 'A valid parent levelId is required' });
  }

  if (!isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Chapter title is required' });
  }

  if (!isOptionalNonEmptyString(input.slug)) {
    issues.push({ field: 'slug', message: 'Chapter slug must be a non-empty string when provided' });
  }

  if (!isOptionalNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Chapter description must be a non-empty string when provided' });
  }

  if (input.sortOrder !== undefined && input.sortOrder !== null && !isInteger(input.sortOrder)) {
    issues.push({ field: 'sortOrder', message: 'Chapter sortOrder must be an integer when provided' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues), 'Chapter payload failed validation', issues);
  }

  return {
    levelId: input.levelId as string,
    title: (input.title as string).trim(),
    slug: (input.slug as string | null | undefined) ?? null,
    description: (input.description as string | null | undefined) ?? null,
    sortOrder: (input.sortOrder as number | null | undefined) ?? null,
  };
}

export function validateUpdateChapterRequest(input: Record<string, unknown>): UpdateChapterRequest {
  const issues: CurriculumValidationDetail[] = [];

  // levelId is set on creation only; moving a chapter to a different level
  // requires a separate, explicit operation (see curriculum-hierarchy-contracts.md).
  rejectImmutableField(
    input,
    'levelId',
    'Chapter levelId cannot be changed with this request. Use a dedicated move operation.',
    issues,
  );

  if (input.title !== undefined && !isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Chapter title must be a non-empty string' });
  }

  if (!isOptionalNonEmptyString(input.slug)) {
    issues.push({ field: 'slug', message: 'Chapter slug must be a non-empty string when provided' });
  }

  if (!isOptionalNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Chapter description must be a non-empty string when provided' });
  }

  if (input.sortOrder !== undefined && !isInteger(input.sortOrder)) {
    issues.push({ field: 'sortOrder', message: 'Chapter sortOrder must be an integer when provided' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues), 'Chapter payload failed validation', issues);
  }

  const result: UpdateChapterRequest = {};

  if (input.title !== undefined) result.title = (input.title as string).trim();
  if (input.slug !== undefined) result.slug = input.slug as string | null;
  if (input.description !== undefined) result.description = input.description as string | null;
  if (input.sortOrder !== undefined) result.sortOrder = input.sortOrder as number;

  return result;
}

function issueCode(issues: readonly CurriculumValidationDetail[]): CurriculumErrorCode {
  if (issues.some((i) => i.field === 'status')) {
    return CurriculumErrorCode.CHAPTER_INVALID_STATUS_TRANSITION;
  }
  if (issues.some((i) => i.field === 'levelId')) {
    return CurriculumErrorCode.CHAPTER_LEVEL_NOT_FOUND;
  }
  if (issues.some((i) => i.field === 'title')) {
    return CurriculumErrorCode.CHAPTER_TITLE_REQUIRED;
  }
  return CurriculumErrorCode.CHAPTER_TITLE_REQUIRED;
}
