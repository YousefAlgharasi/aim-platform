// P10-021: Assessment validation helpers.
//
// Scope: Validate assessment types, deadlines, settings, attempt state,
//        and submitted answers before persistence.
//
// Security rules:
//   - Validation never accepts score, correctness, pass/fail, deadline status,
//     or attempt eligibility from client payloads.
//   - All such values are backend-derived only (grading service, deadline
//     service). Presence of these fields in a client payload is rejected.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { BadRequestException } from '@nestjs/common';

// Inlined from assessment.types.ts (P10-020) until that branch merges
type AssessmentType   = 'quiz' | 'exam';
type AssessmentStatus = 'draft' | 'published' | 'archived';
type AttemptStatus    = 'started' | 'in_progress' | 'submitted' | 'graded' | 'expired';
interface SubmitAnswerDto {
  readonly assessmentQuestionLinkId: string;
  readonly responseValue: string;
}

// ===========================================================================
// Assessment definition validators
// ===========================================================================

const VALID_TYPES: AssessmentType[]   = ['quiz', 'exam'];
const VALID_STATUSES: AssessmentStatus[] = ['draft', 'published', 'archived'];

export function validateAssessmentType(type: unknown): asserts type is AssessmentType {
  if (!VALID_TYPES.includes(type as AssessmentType)) {
    throw new BadRequestException(
      `Invalid assessment type "${type}". Must be one of: ${VALID_TYPES.join(', ')}`,
    );
  }
}

export function validateAssessmentTitle(title: unknown): asserts title is string {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new BadRequestException('Assessment title must be a non-empty string');
  }
  if (title.trim().length > 500) {
    throw new BadRequestException('Assessment title must not exceed 500 characters');
  }
}

export function validateAssessmentStatus(status: unknown): asserts status is AssessmentStatus {
  if (!VALID_STATUSES.includes(status as AssessmentStatus)) {
    throw new BadRequestException(
      `Invalid assessment status "${status}". Must be one of: ${VALID_STATUSES.join(', ')}`,
    );
  }
}

// ===========================================================================
// Assessment settings validators
// ===========================================================================

export function validateTimeLimitSeconds(value: unknown): void {
  if (value === null || value === undefined) return; // nullable
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new BadRequestException('time_limit_seconds must be a positive integer');
  }
}

export function validateMaxAttempts(value: unknown): void {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new BadRequestException('max_attempts must be an integer >= 1');
  }
}

// pass_threshold and late_penalty_percent are backend-owned config;
// they must never be accepted from a client payload.
export function rejectClientScoringFields(body: Record<string, unknown>): void {
  const forbidden = [
    'passThreshold', 'pass_threshold',
    'latePenaltyPercent', 'late_penalty_percent',
    'sectionWeight', 'section_weight',
    'gradingMode', 'grading_mode',
  ];
  const found = forbidden.filter((f) => f in body);
  if (found.length > 0) {
    throw new BadRequestException(
      `Client must not supply grading policy fields: ${found.join(', ')}`,
    );
  }
}

// ===========================================================================
// Deadline validators
// ===========================================================================

export function validateDeadlineWindow(
  opensAt: unknown,
  closesAt: unknown,
): void {
  if (!(opensAt instanceof Date) || !(closesAt instanceof Date)) {
    throw new BadRequestException('opensAt and closesAt must be valid dates');
  }
  if (opensAt >= closesAt) {
    throw new BadRequestException('opensAt must be before closesAt');
  }
}

export function validateExtendedClosesAt(
  closesAt: Date,
  extendedClosesAt: unknown,
): void {
  if (extendedClosesAt === null || extendedClosesAt === undefined) return;
  if (!(extendedClosesAt instanceof Date)) {
    throw new BadRequestException('extendedClosesAt must be a valid date');
  }
  if (extendedClosesAt <= closesAt) {
    throw new BadRequestException('extendedClosesAt must be after closesAt');
  }
}

// deadline status is always backend-derived; reject if client tries to supply it
export function rejectClientDeadlineStatus(body: Record<string, unknown>): void {
  const forbidden = ['status', 'deadlineStatus', 'deadline_status', 'isOpen', 'isClosed'];
  const found = forbidden.filter((f) => f in body);
  if (found.length > 0) {
    throw new BadRequestException(
      `Client must not supply deadline status fields: ${found.join(', ')}`,
    );
  }
}

// ===========================================================================
// Attempt state validators
// ===========================================================================

const VALID_ATTEMPT_STATUSES: AttemptStatus[] = [
  'started', 'in_progress', 'submitted', 'graded', 'expired',
];

export function validateAttemptStatus(status: unknown): asserts status is AttemptStatus {
  if (!VALID_ATTEMPT_STATUSES.includes(status as AttemptStatus)) {
    throw new BadRequestException(`Invalid attempt status: ${status}`);
  }
}

// Reject any client attempt to set attempt eligibility or scoring fields
export function rejectClientAttemptAuthorityFields(body: Record<string, unknown>): void {
  const forbidden = [
    'isCorrect', 'is_correct',
    'score', 'maxScore', 'max_score',
    'passed',
    'attemptEligible', 'attempt_eligible',
    'latePenaltyApplied', 'late_penalty_applied',
    'gradedAt', 'graded_at',
  ];
  const found = forbidden.filter((f) => f in body);
  if (found.length > 0) {
    throw new BadRequestException(
      `Client must not supply authority fields: ${found.join(', ')}`,
    );
  }
}

// ===========================================================================
// Answer submission validators
// ===========================================================================

export function validateSubmitAnswerDto(dto: unknown): asserts dto is SubmitAnswerDto {
  if (typeof dto !== 'object' || dto === null) {
    throw new BadRequestException('Answer submission body must be an object');
  }
  const body = dto as Record<string, unknown>;

  if (typeof body['assessmentQuestionLinkId'] !== 'string' ||
      body['assessmentQuestionLinkId'].trim().length === 0) {
    throw new BadRequestException('assessmentQuestionLinkId must be a non-empty string');
  }

  if (typeof body['responseValue'] !== 'string' ||
      body['responseValue'].trim().length === 0) {
    throw new BadRequestException('responseValue must be a non-empty string');
  }

  // Reject any correctness or scoring field the client tries to inject
  rejectClientAttemptAuthorityFields(body);
}
