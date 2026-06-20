// P10-047: Assessment error handling.
//
// Scope: Standardized error codes and factory helpers for all assessment
//        API error scenarios.
//
// Security rules:
//   - Error messages never leak backend-only data (pass_threshold,
//     late_penalty_percent, correct_answer, grading internals).
//   - Ownership errors return NOT_FOUND (not FORBIDDEN) to prevent
//     existence leaking.

import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../common/errors/app-error';

export enum AssessmentErrorCode {
  ASSESSMENT_NOT_FOUND = 'ASSESSMENT_NOT_FOUND',
  ASSESSMENT_UNAVAILABLE = 'ASSESSMENT_UNAVAILABLE',
  ATTEMPT_NOT_FOUND = 'ATTEMPT_NOT_FOUND',
  ATTEMPT_NOT_OWNED = 'ATTEMPT_NOT_OWNED',
  ATTEMPT_NOT_RESUMABLE = 'ATTEMPT_NOT_RESUMABLE',
  ATTEMPT_ALREADY_SUBMITTED = 'ATTEMPT_ALREADY_SUBMITTED',
  ATTEMPT_EXPIRED = 'ATTEMPT_EXPIRED',
  ATTEMPT_INVALID = 'ATTEMPT_INVALID',
  MAX_ATTEMPTS_REACHED = 'MAX_ATTEMPTS_REACHED',
  DEADLINE_NOT_OPEN = 'DEADLINE_NOT_OPEN',
  DEADLINE_CLOSED = 'DEADLINE_CLOSED',
  DEADLINE_BLOCKS_SUBMISSION = 'DEADLINE_BLOCKS_SUBMISSION',
  RESULT_NOT_FOUND = 'RESULT_NOT_FOUND',
  RESULT_ALREADY_EXISTS = 'RESULT_ALREADY_EXISTS',
  NO_QUESTIONS_FOUND = 'NO_QUESTIONS_FOUND',
}

export function assessmentNotFound(id: string): AppError {
  return new AppError({
    code: AssessmentErrorCode.ASSESSMENT_NOT_FOUND,
    message: `Assessment ${id} not found.`,
    statusCode: HttpStatus.NOT_FOUND,
  });
}

export function assessmentUnavailable(id: string): AppError {
  return new AppError({
    code: AssessmentErrorCode.ASSESSMENT_UNAVAILABLE,
    message: `Assessment ${id} is not available.`,
    statusCode: HttpStatus.CONFLICT,
  });
}

export function attemptNotFound(id: string): AppError {
  return new AppError({
    code: AssessmentErrorCode.ATTEMPT_NOT_FOUND,
    message: 'Assessment attempt not found.',
    statusCode: HttpStatus.NOT_FOUND,
  });
}

export function attemptNotOwned(): AppError {
  return new AppError({
    code: AssessmentErrorCode.ATTEMPT_NOT_OWNED,
    message: 'Assessment attempt not found.',
    statusCode: HttpStatus.NOT_FOUND,
  });
}

export function attemptNotResumable(id: string): AppError {
  return new AppError({
    code: AssessmentErrorCode.ATTEMPT_NOT_RESUMABLE,
    message: `Attempt ${id} cannot be resumed in its current state.`,
    statusCode: HttpStatus.CONFLICT,
  });
}

export function attemptAlreadySubmitted(id: string): AppError {
  return new AppError({
    code: AssessmentErrorCode.ATTEMPT_ALREADY_SUBMITTED,
    message: `Attempt ${id} has already been submitted.`,
    statusCode: HttpStatus.CONFLICT,
  });
}

export function attemptExpired(id: string): AppError {
  return new AppError({
    code: AssessmentErrorCode.ATTEMPT_EXPIRED,
    message: `Attempt ${id} has expired.`,
    statusCode: HttpStatus.CONFLICT,
  });
}

export function attemptInvalid(id: string): AppError {
  return new AppError({
    code: AssessmentErrorCode.ATTEMPT_INVALID,
    message: `Attempt ${id} is in an invalid state for this operation.`,
    statusCode: HttpStatus.CONFLICT,
  });
}

export function maxAttemptsReached(): AppError {
  return new AppError({
    code: AssessmentErrorCode.MAX_ATTEMPTS_REACHED,
    message: 'Maximum number of attempts reached for this assessment.',
    statusCode: HttpStatus.CONFLICT,
  });
}

export function deadlineNotOpen(): AppError {
  return new AppError({
    code: AssessmentErrorCode.DEADLINE_NOT_OPEN,
    message: 'The assessment deadline has not opened yet.',
    statusCode: HttpStatus.CONFLICT,
  });
}

export function deadlineClosed(): AppError {
  return new AppError({
    code: AssessmentErrorCode.DEADLINE_CLOSED,
    message: 'The assessment deadline has closed.',
    statusCode: HttpStatus.CONFLICT,
  });
}

export function deadlineBlocksSubmission(): AppError {
  return new AppError({
    code: AssessmentErrorCode.DEADLINE_BLOCKS_SUBMISSION,
    message: 'The deadline prevents submission at this time.',
    statusCode: HttpStatus.CONFLICT,
  });
}

export function resultNotFound(attemptId: string): AppError {
  return new AppError({
    code: AssessmentErrorCode.RESULT_NOT_FOUND,
    message: 'Assessment result not found.',
    statusCode: HttpStatus.NOT_FOUND,
  });
}

export function resultAlreadyExists(attemptId: string): AppError {
  return new AppError({
    code: AssessmentErrorCode.RESULT_ALREADY_EXISTS,
    message: `Result already exists for attempt ${attemptId}.`,
    statusCode: HttpStatus.CONFLICT,
  });
}

export function noQuestionsFound(assessmentId: string): AppError {
  return new AppError({
    code: AssessmentErrorCode.NO_QUESTIONS_FOUND,
    message: `No questions found for assessment ${assessmentId}.`,
    statusCode: HttpStatus.NOT_FOUND,
  });
}
