// Phase 3 — P3-047
// Shared field-level validation helpers used by the curriculum DTO validators
// in `../dto/*.dto.ts`.
//
// These helpers perform request-payload validation only:
// - required field presence/format checks
// - immutable field rejection on update
// - rejection of client-supplied `status` (status is backend-owned, see
//   `content-status.ts` and `packages/shared-contracts/api/content-status-contracts.md`)
//
// They do NOT perform:
// - publish-requirement checks (Section 5 of content-status-contracts.md) —
//   that is a separate publish-validation task.
// - database lookups (existence, uniqueness, parent status) — those require
//   a repository/service layer and are out of scope for this DTO layer.

import { CurriculumValidationDetail } from './curriculum-validation.error';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Stable, machine-readable identifiers (e.g. `grammar.past_simple.forms`).
// Lowercase letters, digits, and underscores, with `.` separating segments.
const SKILL_KEY_PATTERN = /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/;

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isOptionalNonEmptyString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || isNonEmptyString(value);
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isUuidArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => isUuid(item));
}

export function isStableKey(value: unknown): value is string {
  return typeof value === 'string' && SKILL_KEY_PATTERN.test(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Collects a "status" field present on a create/update payload as a
 * CurriculumValidationDetail, if present.
 *
 * `status` is backend-owned for every curriculum entity — clients must use
 * the dedicated publish/archive/restore workflow endpoints instead of
 * sending `status` on create/update requests (P3-015, Section 6).
 */
export function rejectClientWritableStatus(
  input: Record<string, unknown>,
  issues: CurriculumValidationDetail[],
): void {
  if (Object.prototype.hasOwnProperty.call(input, 'status') && input.status !== undefined) {
    issues.push({
      field: 'status',
      message:
        'Status cannot be set directly. Use the publish, archive, or restore-to-draft endpoints.',
    });
  }
}

/**
 * Collects an immutable-field violation as a CurriculumValidationDetail, if
 * the field is present on an update payload.
 */
export function rejectImmutableField(
  input: Record<string, unknown>,
  field: string,
  message: string,
  issues: CurriculumValidationDetail[],
): void {
  if (Object.prototype.hasOwnProperty.call(input, field) && input[field] !== undefined) {
    issues.push({ field, message });
  }
}
