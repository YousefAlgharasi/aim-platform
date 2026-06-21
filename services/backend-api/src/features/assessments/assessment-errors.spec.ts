// P10-047: Assessment error handling tests.
//
// Scope: Verify all error factories produce correct codes, HTTP status,
//        and never leak backend-only data in messages.

import { HttpStatus } from '@nestjs/common';
import {
  AssessmentErrorCode,
  assessmentNotFound,
  assessmentUnavailable,
  attemptNotFound,
  attemptNotOwned,
  attemptNotResumable,
  attemptAlreadySubmitted,
  attemptExpired,
  attemptInvalid,
  maxAttemptsReached,
  deadlineNotOpen,
  deadlineClosed,
  deadlineBlocksSubmission,
  resultNotFound,
  resultAlreadyExists,
  noQuestionsFound,
} from './assessment-errors';

describe('Assessment Error Handling (P10-047)', () => {
  describe('error code and status mapping', () => {
    const cases: Array<{ name: string; fn: () => any; code: string; status: number }> = [
      { name: 'assessmentNotFound', fn: () => assessmentNotFound('a-1'), code: AssessmentErrorCode.ASSESSMENT_NOT_FOUND, status: HttpStatus.NOT_FOUND },
      { name: 'assessmentUnavailable', fn: () => assessmentUnavailable('a-1'), code: AssessmentErrorCode.ASSESSMENT_UNAVAILABLE, status: HttpStatus.CONFLICT },
      { name: 'attemptNotFound', fn: () => attemptNotFound('att-1'), code: AssessmentErrorCode.ATTEMPT_NOT_FOUND, status: HttpStatus.NOT_FOUND },
      { name: 'attemptNotOwned', fn: () => attemptNotOwned(), code: AssessmentErrorCode.ATTEMPT_NOT_OWNED, status: HttpStatus.NOT_FOUND },
      { name: 'attemptNotResumable', fn: () => attemptNotResumable('att-1'), code: AssessmentErrorCode.ATTEMPT_NOT_RESUMABLE, status: HttpStatus.CONFLICT },
      { name: 'attemptAlreadySubmitted', fn: () => attemptAlreadySubmitted('att-1'), code: AssessmentErrorCode.ATTEMPT_ALREADY_SUBMITTED, status: HttpStatus.CONFLICT },
      { name: 'attemptExpired', fn: () => attemptExpired('att-1'), code: AssessmentErrorCode.ATTEMPT_EXPIRED, status: HttpStatus.CONFLICT },
      { name: 'attemptInvalid', fn: () => attemptInvalid('att-1'), code: AssessmentErrorCode.ATTEMPT_INVALID, status: HttpStatus.CONFLICT },
      { name: 'maxAttemptsReached', fn: () => maxAttemptsReached(), code: AssessmentErrorCode.MAX_ATTEMPTS_REACHED, status: HttpStatus.CONFLICT },
      { name: 'deadlineNotOpen', fn: () => deadlineNotOpen(), code: AssessmentErrorCode.DEADLINE_NOT_OPEN, status: HttpStatus.CONFLICT },
      { name: 'deadlineClosed', fn: () => deadlineClosed(), code: AssessmentErrorCode.DEADLINE_CLOSED, status: HttpStatus.CONFLICT },
      { name: 'deadlineBlocksSubmission', fn: () => deadlineBlocksSubmission(), code: AssessmentErrorCode.DEADLINE_BLOCKS_SUBMISSION, status: HttpStatus.CONFLICT },
      { name: 'resultNotFound', fn: () => resultNotFound('att-1'), code: AssessmentErrorCode.RESULT_NOT_FOUND, status: HttpStatus.NOT_FOUND },
      { name: 'resultAlreadyExists', fn: () => resultAlreadyExists('att-1'), code: AssessmentErrorCode.RESULT_ALREADY_EXISTS, status: HttpStatus.CONFLICT },
      { name: 'noQuestionsFound', fn: () => noQuestionsFound('a-1'), code: AssessmentErrorCode.NO_QUESTIONS_FOUND, status: HttpStatus.NOT_FOUND },
    ];

    for (const { name, fn, code, status } of cases) {
      it(`${name} → code=${code}, status=${status}`, () => {
        const err = fn();
        expect(err.code).toBe(code);
        expect(err.statusCode).toBe(status);
        expect(err).toBeInstanceOf(Error);
      });
    }
  });

  describe('error messages never leak backend-only data', () => {
    const allErrors = [
      assessmentNotFound('a-1'),
      assessmentUnavailable('a-1'),
      attemptNotFound('att-1'),
      attemptNotOwned(),
      attemptNotResumable('att-1'),
      attemptAlreadySubmitted('att-1'),
      attemptExpired('att-1'),
      attemptInvalid('att-1'),
      maxAttemptsReached(),
      deadlineNotOpen(),
      deadlineClosed(),
      deadlineBlocksSubmission(),
      resultNotFound('att-1'),
      resultAlreadyExists('att-1'),
      noQuestionsFound('a-1'),
    ];

    const forbidden = [
      'pass_threshold', 'passThreshold',
      'late_penalty_percent', 'latePenaltyPercent',
      'correct_answer', 'correctAnswer',
      'is_correct', 'isCorrect',
      'grading_mode', 'gradingMode',
      'section_weight', 'sectionWeight',
    ];

    for (const err of allErrors) {
      it(`${err.code} message does not contain backend-only terms`, () => {
        for (const term of forbidden) {
          expect(err.message).not.toContain(term);
        }
      });
    }
  });

  describe('ownership errors use NOT_FOUND to prevent existence leaking', () => {
    it('attemptNotOwned returns 404, not 403', () => {
      const err = attemptNotOwned();
      expect(err.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(err.statusCode).not.toBe(HttpStatus.FORBIDDEN);
    });

    it('attemptNotFound returns 404', () => {
      expect(attemptNotFound('att-1').statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('resultNotFound returns 404', () => {
      expect(resultNotFound('att-1').statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('all AssessmentErrorCode values are unique', () => {
    it('no duplicate enum values', () => {
      const values = Object.values(AssessmentErrorCode);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });
  });
});
