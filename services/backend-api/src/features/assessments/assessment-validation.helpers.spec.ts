// P10-021: Assessment validation tests.

import { BadRequestException } from '@nestjs/common';
import {
  validateAssessmentType,
  validateAssessmentTitle,
  validateTimeLimitSeconds,
  validateMaxAttempts,
  rejectClientScoringFields,
  validateDeadlineWindow,
  validateExtendedClosesAt,
  rejectClientDeadlineStatus,
  rejectClientAttemptAuthorityFields,
  validateSubmitAnswerDto,
} from './assessment-validation.helpers';

describe('Assessment Validation', () => {

  describe('validateAssessmentType', () => {
    it('accepts quiz and exam', () => {
      expect(() => validateAssessmentType('quiz')).not.toThrow();
      expect(() => validateAssessmentType('exam')).not.toThrow();
    });
    it('rejects unknown types', () => {
      expect(() => validateAssessmentType('test')).toThrow(BadRequestException);
      expect(() => validateAssessmentType(null)).toThrow(BadRequestException);
    });
  });

  describe('validateAssessmentTitle', () => {
    it('accepts valid title', () => {
      expect(() => validateAssessmentTitle('Unit 3 Quiz')).not.toThrow();
    });
    it('rejects empty string', () => {
      expect(() => validateAssessmentTitle('')).toThrow(BadRequestException);
      expect(() => validateAssessmentTitle('   ')).toThrow(BadRequestException);
    });
    it('rejects non-string', () => {
      expect(() => validateAssessmentTitle(123)).toThrow(BadRequestException);
    });
  });

  describe('validateTimeLimitSeconds', () => {
    it('accepts positive integer', () => {
      expect(() => validateTimeLimitSeconds(900)).not.toThrow();
    });
    it('accepts null (no limit)', () => {
      expect(() => validateTimeLimitSeconds(null)).not.toThrow();
    });
    it('rejects zero or negative', () => {
      expect(() => validateTimeLimitSeconds(0)).toThrow(BadRequestException);
      expect(() => validateTimeLimitSeconds(-1)).toThrow(BadRequestException);
    });
  });

  describe('validateMaxAttempts', () => {
    it('accepts integer >= 1', () => {
      expect(() => validateMaxAttempts(1)).not.toThrow();
      expect(() => validateMaxAttempts(3)).not.toThrow();
    });
    it('rejects 0 or negative', () => {
      expect(() => validateMaxAttempts(0)).toThrow(BadRequestException);
    });
  });

  describe('rejectClientScoringFields', () => {
    it('passes clean body', () => {
      expect(() => rejectClientScoringFields({ title: 'Quiz' })).not.toThrow();
    });
    it('rejects passThreshold', () => {
      expect(() => rejectClientScoringFields({ passThreshold: 60 })).toThrow(BadRequestException);
    });
    it('rejects latePenaltyPercent', () => {
      expect(() => rejectClientScoringFields({ latePenaltyPercent: 10 })).toThrow(BadRequestException);
    });
    it('rejects sectionWeight', () => {
      expect(() => rejectClientScoringFields({ sectionWeight: 0.5 })).toThrow(BadRequestException);
    });
  });

  describe('validateDeadlineWindow', () => {
    const open = new Date('2026-06-20T00:00:00Z');
    const close = new Date('2026-06-27T23:59:00Z');
    it('accepts valid window', () => {
      expect(() => validateDeadlineWindow(open, close)).not.toThrow();
    });
    it('rejects opensAt >= closesAt', () => {
      expect(() => validateDeadlineWindow(close, open)).toThrow(BadRequestException);
      expect(() => validateDeadlineWindow(open, open)).toThrow(BadRequestException);
    });
    it('rejects non-dates', () => {
      expect(() => validateDeadlineWindow('2026-06-20', close)).toThrow(BadRequestException);
    });
  });

  describe('validateExtendedClosesAt', () => {
    const closes = new Date('2026-06-27T23:59:00Z');
    it('accepts null', () => {
      expect(() => validateExtendedClosesAt(closes, null)).not.toThrow();
    });
    it('accepts date after closesAt', () => {
      const ext = new Date('2026-06-28T23:59:00Z');
      expect(() => validateExtendedClosesAt(closes, ext)).not.toThrow();
    });
    it('rejects date before or equal to closesAt', () => {
      expect(() => validateExtendedClosesAt(closes, closes)).toThrow(BadRequestException);
    });
  });

  describe('rejectClientDeadlineStatus', () => {
    it('passes body without status', () => {
      expect(() => rejectClientDeadlineStatus({ opensAt: '...' })).not.toThrow();
    });
    it('rejects status field', () => {
      expect(() => rejectClientDeadlineStatus({ status: 'open' })).toThrow(BadRequestException);
    });
    it('rejects deadlineStatus field', () => {
      expect(() => rejectClientDeadlineStatus({ deadlineStatus: 'closed' })).toThrow(BadRequestException);
    });
  });

  describe('rejectClientAttemptAuthorityFields', () => {
    it('passes clean answer body', () => {
      expect(() => rejectClientAttemptAuthorityFields({
        assessmentQuestionLinkId: 'ql-1',
        responseValue: 'A',
      })).not.toThrow();
    });
    it('rejects isCorrect', () => {
      expect(() => rejectClientAttemptAuthorityFields({ isCorrect: true })).toThrow(BadRequestException);
    });
    it('rejects score', () => {
      expect(() => rejectClientAttemptAuthorityFields({ score: 90 })).toThrow(BadRequestException);
    });
    it('rejects passed', () => {
      expect(() => rejectClientAttemptAuthorityFields({ passed: true })).toThrow(BadRequestException);
    });
  });

  describe('validateSubmitAnswerDto', () => {
    it('accepts valid dto', () => {
      expect(() => validateSubmitAnswerDto({
        assessmentQuestionLinkId: 'ql-1',
        responseValue: 'A',
      })).not.toThrow();
    });
    it('rejects missing assessmentQuestionLinkId', () => {
      expect(() => validateSubmitAnswerDto({ responseValue: 'A' })).toThrow(BadRequestException);
    });
    it('rejects empty responseValue', () => {
      expect(() => validateSubmitAnswerDto({
        assessmentQuestionLinkId: 'ql-1',
        responseValue: '',
      })).toThrow(BadRequestException);
    });
    it('rejects dto with injected isCorrect', () => {
      expect(() => validateSubmitAnswerDto({
        assessmentQuestionLinkId: 'ql-1',
        responseValue: 'A',
        isCorrect: true,
      })).toThrow(BadRequestException);
    });
    it('rejects dto with injected score', () => {
      expect(() => validateSubmitAnswerDto({
        assessmentQuestionLinkId: 'ql-1',
        responseValue: 'A',
        score: 100,
      })).toThrow(BadRequestException);
    });
  });
});
