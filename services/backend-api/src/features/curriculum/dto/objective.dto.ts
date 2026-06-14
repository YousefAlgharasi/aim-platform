// Phase 3 — P3-047
// Objective request payload validation.
//
// Source of truth: packages/shared-contracts/api/skill-objective-contracts.md
// (Create/Update Objective Request, P3-012).
//
// Note on field naming: skill-objective-contracts.md names the objective's
// text field `title`, while packages/shared-contracts/api/errors.md (P3-016)
// names the corresponding error `OBJECTIVE_TEXT_REQUIRED`. This validator
// validates the `title` field (per the P3-012 contract) and reports it using
// the `OBJECTIVE_TEXT_REQUIRED` code (per the P3-016 contract). See the
// P3-047 completion notes for this documented naming conflict.
//
// Note on `status`: see skill.dto.ts — status is rejected on create/update
// per content-status-contracts.md (P3-015), even though
// skill-objective-contracts.md lists `status` on UpdateObjectiveRequest.

import { CurriculumErrorCode } from '../validation/curriculum-error-code';
import { CurriculumValidationDetail, CurriculumValidationError } from '../validation/curriculum-validation.error';
import {
  isNonEmptyString,
  isOptionalNonEmptyString,
  isStableKey,
  isUuidArray,
  rejectClientWritableStatus,
} from '../validation/validation-helpers';

export interface CreateObjectiveRequest {
  key?: string | null;
  title: string;
  description?: string | null;
  linkedSkillIds?: string[];
}

export interface UpdateObjectiveRequest {
  key?: string | null;
  title?: string;
  description?: string | null;
  linkedSkillIds?: string[];
}

export function validateCreateObjectiveRequest(input: Record<string, unknown>): CreateObjectiveRequest {
  const issues: CurriculumValidationDetail[] = [];

  if (!isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Objective text (title) is required' });
  }

  if (input.key !== undefined && input.key !== null && !isStableKey(input.key)) {
    issues.push({
      field: 'key',
      message: 'Objective key must be a stable, dot-delimited identifier when provided',
    });
  }

  if (!isOptionalNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Objective description must be a non-empty string when provided' });
  }

  if (input.linkedSkillIds !== undefined && !isUuidArray(input.linkedSkillIds)) {
    issues.push({ field: 'linkedSkillIds', message: 'linkedSkillIds must be an array of skill UUIDs' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues), 'Objective payload failed validation', issues);
  }

  const result: CreateObjectiveRequest = {
    title: (input.title as string).trim(),
    description: (input.description as string | null | undefined) ?? null,
  };

  if (input.key !== undefined) result.key = input.key as string | null;
  if (input.linkedSkillIds !== undefined) result.linkedSkillIds = input.linkedSkillIds as string[];

  return result;
}

export function validateUpdateObjectiveRequest(input: Record<string, unknown>): UpdateObjectiveRequest {
  const issues: CurriculumValidationDetail[] = [];

  if (input.title !== undefined && !isNonEmptyString(input.title)) {
    issues.push({ field: 'title', message: 'Objective text (title) must be a non-empty string' });
  }

  if (input.key !== undefined && input.key !== null && !isStableKey(input.key)) {
    issues.push({
      field: 'key',
      message: 'Objective key must be a stable, dot-delimited identifier when provided',
    });
  }

  if (!isOptionalNonEmptyString(input.description)) {
    issues.push({ field: 'description', message: 'Objective description must be a non-empty string when provided' });
  }

  if (input.linkedSkillIds !== undefined && !isUuidArray(input.linkedSkillIds)) {
    issues.push({ field: 'linkedSkillIds', message: 'linkedSkillIds must be an array of skill UUIDs' });
  }

  rejectClientWritableStatus(input, issues);

  if (issues.length > 0) {
    throw new CurriculumValidationError(issueCode(issues), 'Objective payload failed validation', issues);
  }

  const result: UpdateObjectiveRequest = {};

  if (input.title !== undefined) result.title = (input.title as string).trim();
  if (input.key !== undefined) result.key = input.key as string | null;
  if (input.description !== undefined) result.description = input.description as string | null;
  if (input.linkedSkillIds !== undefined) result.linkedSkillIds = input.linkedSkillIds as string[];

  return result;
}

function issueCode(issues: readonly CurriculumValidationDetail[]): CurriculumErrorCode {
  if (issues.some((i) => i.field === 'status')) {
    return CurriculumErrorCode.OBJECTIVE_INVALID_STATUS_TRANSITION;
  }
  if (issues.some((i) => i.field === 'title')) {
    return CurriculumErrorCode.OBJECTIVE_TEXT_REQUIRED;
  }
  if (issues.some((i) => i.field === 'linkedSkillIds')) {
    return CurriculumErrorCode.OBJECTIVE_SKILL_NOT_FOUND;
  }
  return CurriculumErrorCode.OBJECTIVE_TEXT_REQUIRED;
}
