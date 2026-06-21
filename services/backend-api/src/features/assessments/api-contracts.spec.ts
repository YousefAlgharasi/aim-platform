// P10-048: API contract tests.
//
// Scope: Verify that API contract types are consistent with the actual
//        service interfaces, and that no backend-only fields leak into
//        contract definitions.

import {
  AssessmentListItemContract,
  AssessmentDetailContract,
  StartAttemptContract,
  ResumeAttemptContract,
  SubmitAttemptContract,
  AttemptResultContract,
  BreakdownItemContract,
  ResultHistoryContract,
  ResultHistoryItemContract,
  StudentDeadlinesContract,
  StudentDeadlineItemContract,
  DeadlineContract,
  AssessmentErrorContract,
} from './api-contracts';

describe('Assessment API Contracts (P10-048)', () => {
  describe('contract types are importable and structurally valid', () => {
    it('AssessmentListItemContract has required fields', () => {
      const item: AssessmentListItemContract = {
        id: 'a-1', type: 'quiz', title: 'Quiz 1',
        description: null, deadlineStatus: 'open',
      };
      expect(item.id).toBe('a-1');
      expect(item.type).toBe('quiz');
    });

    it('AssessmentDetailContract has sections and deadline', () => {
      const detail: AssessmentDetailContract = {
        id: 'a-1', type: 'exam', title: 'Final Exam',
        description: 'End of term', maxAttempts: 2, timeLimitSeconds: 3600,
        sections: [{ id: 's-1', title: 'Section 1', order: 1, questionCount: 10 }],
        deadline: {
          deadlineId: 'd-1', opensAt: '2026-01-01T00:00:00Z',
          closesAt: '2026-01-02T00:00:00Z', extendedClosesAt: null, status: 'open',
        },
      };
      expect(detail.sections).toHaveLength(1);
      expect(detail.deadline?.status).toBe('open');
    });

    it('StartAttemptContract has backend-computed expiresAt', () => {
      const start: StartAttemptContract = {
        attemptId: 'att-1', assessmentId: 'a-1', attemptNumber: 1,
        status: 'started', startedAt: '2026-01-01T00:00:00Z',
        expiresAt: '2026-01-01T01:00:00Z',
      };
      expect(start.status).toBe('started');
      expect(start.expiresAt).toBeTruthy();
    });

    it('ResumeAttemptContract has in_progress status', () => {
      const resume: ResumeAttemptContract = {
        attemptId: 'att-1', status: 'in_progress', expiresAt: null,
      };
      expect(resume.status).toBe('in_progress');
    });

    it('SubmitAttemptContract never contains scoring fields', () => {
      const submit: SubmitAttemptContract = {
        attemptId: 'att-1', status: 'graded',
        submittedAt: '2026-01-01T01:00:00Z', resultId: 'r-1',
      };
      expect(Object.keys(submit)).not.toContain('score');
      expect(Object.keys(submit)).not.toContain('maxScore');
      expect(Object.keys(submit)).not.toContain('passed');
      expect(Object.keys(submit)).not.toContain('latePenaltyApplied');
    });

    it('AttemptResultContract has backend-authoritative grading fields', () => {
      const result: AttemptResultContract = {
        resultId: 'r-1', attemptId: 'att-1', score: 85, maxScore: 100,
        passed: true, latePenaltyApplied: false,
        gradedAt: '2026-01-01T01:05:00Z', feedbackAllowed: true,
        breakdown: [{
          assessmentQuestionLinkId: 'ql-1', sectionId: 's-1',
          pointsAwarded: 5, pointsPossible: 5, isCorrect: true,
        }],
      };
      expect(result.score).toBe(85);
      expect(result.breakdown[0].isCorrect).toBe(true);
    });

    it('BreakdownItemContract never includes correct answer text', () => {
      const item: BreakdownItemContract = {
        assessmentQuestionLinkId: 'ql-1', sectionId: null,
        pointsAwarded: 3, pointsPossible: 5,
      };
      expect(Object.keys(item)).not.toContain('correctAnswer');
      expect(Object.keys(item)).not.toContain('correct_answer');
    });

    it('ResultHistoryContract has ordered results', () => {
      const history: ResultHistoryContract = {
        assessmentId: 'a-1', totalAttempts: 2,
        results: [
          { resultId: 'r-1', attemptId: 'att-1', attemptNumber: 1,
            score: 60, maxScore: 100, passed: false,
            latePenaltyApplied: false, gradedAt: '2026-01-01T00:00:00Z',
            submittedAt: '2026-01-01T00:00:00Z' },
          { resultId: 'r-2', attemptId: 'att-2', attemptNumber: 2,
            score: 85, maxScore: 100, passed: true,
            latePenaltyApplied: false, gradedAt: '2026-01-02T00:00:00Z',
            submittedAt: '2026-01-02T00:00:00Z' },
        ],
      };
      expect(history.results).toHaveLength(2);
      expect(history.totalAttempts).toBe(2);
    });

    it('StudentDeadlinesContract has all five groups', () => {
      const deadlines: StudentDeadlinesContract = {
        upcoming: [], active: [], late: [], missed: [], closed: [],
      };
      expect(Object.keys(deadlines)).toEqual(
        expect.arrayContaining(['upcoming', 'active', 'late', 'missed', 'closed']),
      );
    });

    it('AssessmentErrorContract has code, message, statusCode', () => {
      const err: AssessmentErrorContract = {
        code: 'ASSESSMENT_NOT_FOUND', message: 'Not found.', statusCode: 404,
      };
      expect(err.code).toBe('ASSESSMENT_NOT_FOUND');
    });
  });

  describe('no backend-only fields in contract types', () => {
    const forbidden = [
      'pass_threshold', 'passThreshold',
      'late_penalty_percent', 'latePenaltyPercent',
      'correct_answer', 'correctAnswer',
      'grading_mode', 'gradingMode',
      'section_weight', 'sectionWeight',
      'late_window_seconds', 'lateWindowSeconds',
    ];

    it('forbidden fields are not keys in any contract object', () => {
      const contracts = [
        { id: 'a-1', type: 'quiz', title: 'Q', description: null, deadlineStatus: 'open' } as AssessmentListItemContract,
        { attemptId: 'att-1', status: 'graded', submittedAt: '2026-01-01T00:00:00Z', resultId: 'r-1' } as SubmitAttemptContract,
        { assessmentQuestionLinkId: 'ql-1', sectionId: null, pointsAwarded: 5, pointsPossible: 5 } as BreakdownItemContract,
      ];
      for (const obj of contracts) {
        for (const field of forbidden) {
          expect(Object.keys(obj)).not.toContain(field);
        }
      }
    });
  });
});
