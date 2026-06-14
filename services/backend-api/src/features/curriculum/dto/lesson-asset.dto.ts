// Phase 3 — P3-047
// Lesson Asset request payload validation.
//
// Source of truth: packages/shared-contracts/api/lesson-asset-contracts.md (P3-013).
//
// Scope notes:
// - `alt_text` is a PUBLISH requirement for `image` assets (ASSET_MISSING_ALT_TEXT
//   is raised when publishing, per content-status-contracts.md Section 5), not a
//   create/update requirement. It is validated as an optional string here.
// - Cross-field consistency (e.g. duration_seconds only meaningful for
//   audio/video) is left to the publish-validation/service layer.
// - `lesson_id` and `type` are set on creation only and are rejected on update
//   (ASSET_LESSON_ID_IMMUTABLE / ASSET_TYPE_IMMUTABLE).

import { CurriculumErrorCode } from '../validation/curriculum-error-code';
import { CurriculumValidationDetail, CurriculumValidationError } from '../validation/curriculum-validation.error';
import {
  isInteger,
  isNonEmptyString,
  isOptionalNonEmptyString,
  isPositiveInteger,
  isUuid,
  rejectClientWritableStatus,
  rejectImmutableField,
} from '../validation/validation-helpers';

export const LESSON_ASSET_TYPES = ['image', 'audio', 'video', 'document', 'external_reference'] as const;

export type LessonAssetType = (typeof LESSON_ASSET_TYPES)[number];

export function isLessonAssetType(value: unknown): value is LessonAssetType {
  return typeof value === 'string' && (LESSON_ASSET_TYPES as readonly string[]).includes(value);
}

// Asset types that always require a `url` (document assets may rely on
// inline content/metadata instead, per P3-013 Section 4.1).
const URL_REQUIRED_TYPES: readonly LessonAssetType[] = ['image', 'audio', 'video', 'external_reference'];

const ABSOLUTE_URL_PATTERN = /^https?:\/\/.+/i;

export interface CreateLessonAssetRequest {
  lessonId: string;
  type: LessonAssetType;
  title: string;
  description?: string | null;
  url?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  durationSeconds?: number | null;
  altText?: string | null;
  thumbnailUrl?: string | null;
  order?: number;
  metadata?: Record<string, unknown> | null;
}

export interface UpdateLessonAssetRequest {
  title?: string;
  description?: string | null;
  url?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  durationSeconds?: number | null;
  altText?: string | null;
  thumbnailUrl?: string | null;
  order?: number;
  metadata?: Record<string, unknown> | null;
}

export function validateCreateLessonAssetRequest(input: Record<string, unknown>): CreateLessonAssetRequest {
  const issues: CurriculumValidationDetail[] = [];

  if (!isUuid(input.lessonId)) {
    issues.push({ field: 'lessonId', message: 'A valid parent lessonId is required' });
  }

  if (!isLessonAssetType(input.type)) {
    issues.push({ field: 'type', message: 'Asset type must be one of: image, audio, video, document, external_reference' });
  }

  if (!isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Asset title is required' });
  }

  validateOptionalAssetFields(input, issues);

  if (isLessonAssetType(input.type) && URL_REQUIRED_TYPES.includes(input.type)) {
    if (!isNonEmptyString(input.url)) {
      issues.push({ field: 'url', message: `Asset url is required for type '${input.type}'` });
    }
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues, 'create'), 'Lesson asset payload failed validation', issues);
  }

  return {
    lessonId: input.lessonId as string,
    type: input.type as LessonAssetType,
    title: (input.title as string).trim(),
    description: (input.description as string | null | undefined) ?? null,
    url: (input.url as string | null | undefined) ?? null,
    mimeType: (input.mimeType as string | null | undefined) ?? null,
    sizeBytes: (input.sizeBytes as number | null | undefined) ?? null,
    durationSeconds: (input.durationSeconds as number | null | undefined) ?? null,
    altText: (input.altText as string | null | undefined) ?? null,
    thumbnailUrl: (input.thumbnailUrl as string | null | undefined) ?? null,
    order: input.order as number | undefined,
    metadata: (input.metadata as Record<string, unknown> | null | undefined) ?? null,
  };
}

export function validateUpdateLessonAssetRequest(input: Record<string, unknown>): UpdateLessonAssetRequest {
  const issues: CurriculumValidationDetail[] = [];

  rejectImmutableField(input, 'lessonId', 'Asset lessonId cannot be changed after creation.', issues);
  rejectImmutableField(input, 'type', 'Asset type cannot be changed after creation.', issues);

  if (input.title !== undefined && !isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Asset title must be a non-empty string' });
  }

  validateOptionalAssetFields(input, issues);

  if (input.url !== undefined && !isOptionalNonEmptyString(input.url)) {
    issues.push({ field: 'url', message: 'Asset url must be a non-empty string when provided' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues, 'update'), 'Lesson asset payload failed validation', issues);
  }

  const result: UpdateLessonAssetRequest = {};

  if (input.title !== undefined) result.title = (input.title as string).trim();
  if (input.description !== undefined) result.description = input.description as string | null;
  if (input.url !== undefined) result.url = input.url as string | null;
  if (input.mimeType !== undefined) result.mimeType = input.mimeType as string | null;
  if (input.sizeBytes !== undefined) result.sizeBytes = input.sizeBytes as number | null;
  if (input.durationSeconds !== undefined) result.durationSeconds = input.durationSeconds as number | null;
  if (input.altText !== undefined) result.altText = input.altText as string | null;
  if (input.thumbnailUrl !== undefined) result.thumbnailUrl = input.thumbnailUrl as string | null;
  if (input.order !== undefined) result.order = input.order as number;
  if (input.metadata !== undefined) result.metadata = input.metadata as Record<string, unknown> | null;

  return result;
}

/**
 * Field checks shared between create and update payloads: description,
 * mimeType, sizeBytes, durationSeconds, altText, thumbnailUrl, order, url
 * format, and url absolute-format when present.
 */
function validateOptionalAssetFields(
  input: Record<string, unknown>,
  issues: CurriculumValidationDetail[],
): void {
  if (!isOptionalNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Asset description must be a non-empty string when provided' });
  }

  if (!isOptionalNonEmptyString(input.mimeType)) {
    issues.push({ field: 'mimeType', message: 'Asset mimeType must be a non-empty string when provided' });
  }

  if (input.sizeBytes !== undefined && input.sizeBytes !== null && !(isInteger(input.sizeBytes) && input.sizeBytes >= 0)) {
    issues.push({ field: 'sizeBytes', message: 'Asset sizeBytes must be a non-negative integer when provided' });
  }

  if (
    input.durationSeconds !== undefined &&
    input.durationSeconds !== null &&
    !(isInteger(input.durationSeconds) && input.durationSeconds >= 0)
  ) {
    issues.push({ field: 'durationSeconds', message: 'Asset durationSeconds must be a non-negative integer when provided' });
  }

  if (!isOptionalNonEmptyString(input.altText)) {
    issues.push({ field: 'altText', message: 'Asset altText must be a non-empty string when provided' });
  }

  if (!isOptionalNonEmptyString(input.thumbnailUrl)) {
    issues.push({ field: 'thumbnailUrl', message: 'Asset thumbnailUrl must be a non-empty string when provided' });
  } else if (typeof input.thumbnailUrl === 'string' && !ABSOLUTE_URL_PATTERN.test(input.thumbnailUrl)) {
    issues.push({ field: 'thumbnailUrl', message: 'Asset thumbnailUrl must be an absolute http(s) URL' });
  }

  if (input.order !== undefined && !isPositiveInteger(input.order)) {
    issues.push({ field: 'order', message: 'Asset order must be a positive integer when provided' });
  }

  if (typeof input.url === 'string' && input.url.trim().length > 0 && !ABSOLUTE_URL_PATTERN.test(input.url)) {
    issues.push({ field: 'url', message: 'Asset url must be an absolute http(s) URL' });
  }
}

function issueCode(
  issues: readonly CurriculumValidationDetail[],
  context: 'create' | 'update',
): CurriculumErrorCode {
  if (issues.some((i) => i.field === 'status')) {
    return CurriculumErrorCode.ASSET_INVALID_STATUS_TRANSITION;
  }
  if (issues.some((i) => i.field === 'lessonId')) {
    return context === 'update' ? CurriculumErrorCode.ASSET_LESSON_ID_IMMUTABLE : CurriculumErrorCode.ASSET_LESSON_NOT_FOUND;
  }
  if (issues.some((i) => i.field === 'type')) {
    return context === 'update' ? CurriculumErrorCode.ASSET_TYPE_IMMUTABLE : CurriculumErrorCode.ASSET_INVALID_TYPE;
  }
  if (issues.some((i) => i.field === 'title')) {
    return CurriculumErrorCode.ASSET_TITLE_REQUIRED;
  }
  if (issues.some((i) => i.field === 'url')) {
    return CurriculumErrorCode.ASSET_MISSING_URL;
  }
  if (issues.some((i) => i.field === 'order')) {
    return CurriculumErrorCode.ASSET_ORDER_CONFLICT;
  }
  return CurriculumErrorCode.ASSET_TITLE_REQUIRED;
}
