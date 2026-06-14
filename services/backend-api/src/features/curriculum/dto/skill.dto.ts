// Phase 3 — P3-047
// Skill request payload validation.
//
// Source of truth: packages/shared-contracts/api/skill-objective-contracts.md
// (Create/Update Skill Request, P3-011).
//
// Note on `status`: skill-objective-contracts.md lists `status` on
// UpdateSkillRequest, but content-status-contracts.md (P3-015, Section 6)
// states status is never client-writable on create/update payloads for any
// entity and must go through the publish/archive/restore endpoints instead.
// This validator follows P3-015 (the later, canonical status-lifecycle
// contract) and rejects a client-supplied `status`. See the P3-047
// completion notes for this documented conflict.

import { CurriculumErrorCode } from '../validation/curriculum-error-code';
import { CurriculumValidationDetail, CurriculumValidationError } from '../validation/curriculum-validation.error';
import {
  isNonEmptyString,
  isOptionalNonEmptyString,
  isStableKey,
  isUuid,
  rejectClientWritableStatus,
  rejectImmutableField,
} from '../validation/validation-helpers';

export const SKILL_DOMAINS = [
  'grammar',
  'vocabulary',
  'reading',
  'listening',
  'speaking',
  'writing',
  'pronunciation',
  'functional_language',
] as const;

export type SkillDomain = (typeof SKILL_DOMAINS)[number];

export function isSkillDomain(value: unknown): value is SkillDomain {
  return typeof value === 'string' && (SKILL_DOMAINS as readonly string[]).includes(value);
}

export interface CreateSkillRequest {
  key: string;
  title: string;
  description?: string | null;
  domain: SkillDomain;
  parentSkillId?: string | null;
}

export interface UpdateSkillRequest {
  title?: string;
  description?: string | null;
  domain?: SkillDomain;
  parentSkillId?: string | null;
}

export function validateCreateSkillRequest(input: Record<string, unknown>): CreateSkillRequest {
  const issues: CurriculumValidationDetail[] = [];

  if (input.key === undefined || input.key === null || (typeof input.key === 'string' && input.key.trim().length === 0)) {
    issues.push({ field: 'key', message: 'Skill key is required' });
  } else if (!isStableKey(input.key)) {
    issues.push({
      field: 'key',
      message: 'Skill key must be a stable, dot-delimited identifier (e.g. grammar.past_simple.forms)',
    });
  }

  if (!isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Skill title is required' });
  }

  if (!isOptionalNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Skill description must be a non-empty string when provided' });
  }

  if (!isSkillDomain(input.domain)) {
    issues.push({ field: 'domain', message: 'Skill domain must be one of the allowed skill domain values' });
  }

  if (input.parentSkillId !== undefined && input.parentSkillId !== null && !isUuid(input.parentSkillId)) {
    issues.push({ field: 'parentSkillId', message: 'parentSkillId must be a valid skill UUID when provided' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues, 'create'), 'Skill payload failed validation', issues);
  }

  return {
    key: (input.key as string).trim(),
    title: (input.title as string).trim(),
    description: (input.description as string | null | undefined) ?? null,
    domain: input.domain as SkillDomain,
    parentSkillId: (input.parentSkillId as string | null | undefined) ?? null,
  };
}

export function validateUpdateSkillRequest(input: Record<string, unknown>): UpdateSkillRequest {
  const issues: CurriculumValidationDetail[] = [];

  // Changing `key` is restricted to an explicit migration workflow
  // (skill-objective-contracts.md, Update Skill Request rules).
  rejectImmutableField(
    input,
    'key',
    'Skill key cannot be changed with this request. Use the dedicated key-migration workflow.',
    issues,
  );

  if (input.title !== undefined && !isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Skill title must be a non-empty string' });
  }

  if (!isOptionalNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Skill description must be a non-empty string when provided' });
  }

  if (input.domain !== undefined && !isSkillDomain(input.domain)) {
    issues.push({ field: 'domain', message: 'Skill domain must be one of the allowed skill domain values' });
  }

  if (input.parentSkillId !== undefined && input.parentSkillId !== null && !isUuid(input.parentSkillId)) {
    issues.push({ field: 'parentSkillId', message: 'parentSkillId must be a valid skill UUID when provided' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues, 'update'), 'Skill payload failed validation', issues);
  }

  const result: UpdateSkillRequest = {};

  if (input.title !== undefined) result.title = (input.title as string).trim();
  if (input.description !== undefined) result.description = input.description as string | null;
  if (input.domain !== undefined) result.domain = input.domain as SkillDomain;
  if (input.parentSkillId !== undefined) result.parentSkillId = input.parentSkillId as string | null;

  return result;
}

function issueCode(
  issues: readonly CurriculumValidationDetail[],
  context: 'create' | 'update',
): CurriculumErrorCode {
  if (issues.some((i) => i.field === 'status')) {
    return CurriculumErrorCode.SKILL_INVALID_STATUS_TRANSITION;
  }
  if (issues.some((i) => i.field === 'key')) {
    return context === 'update'
      ? CurriculumErrorCode.SKILL_KEY_CONFLICT
      : isStableKeyIssue(issues)
        ? CurriculumErrorCode.SKILL_KEY_INVALID
        : CurriculumErrorCode.SKILL_KEY_REQUIRED;
  }
  if (issues.some((i) => i.field === 'title')) {
    return CurriculumErrorCode.SKILL_TITLE_REQUIRED;
  }
  if (issues.some((i) => i.field === 'domain')) {
    return CurriculumErrorCode.SKILL_DOMAIN_INVALID;
  }
  if (issues.some((i) => i.field === 'parentSkillId')) {
    return CurriculumErrorCode.SKILL_NOT_FOUND;
  }
  return CurriculumErrorCode.SKILL_TITLE_REQUIRED;
}

function isStableKeyIssue(issues: readonly CurriculumValidationDetail[]): boolean {
  return issues.some((i) => i.field === 'key' && i.message.includes('stable'));
}
