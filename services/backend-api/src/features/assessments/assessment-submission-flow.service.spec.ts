// P10-037: AssessmentSubmissionFlowService unit tests.

import { AssessmentSubmissionFlowService } from './assessment-submission-flow.service';

function makeAttemptLifecycle(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    submitAttempt: jest.fn().mockResolvedValue({
      attemptId: 'att-1', status: 'submitted', submittedAt: new Date('2026-01-01T00:00:00Z'), resultId: null,
    }),
    ...overrides,
  };
}

function makeGradingService(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    gradeAttempt: jest.fn().mockResolvedValue({
      attemptId: 'att-1', assessmentId: 'a-1', studentId: 'stu-1',
      score: 8, maxScore: 10, passed: true, latePenaltyApplied: false,
      gradedAt: new Date('2026-01-01T00:00:01Z'), outcomes: [],
    }),
    ...overrides,
  };
}

function makeResultService(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    persistResult: jest.fn().mockResolvedValue({
      resultId: 'result-1', attemptId: 'att-1', assessmentId: 'a-1', studentId: 'stu-1',
      score: 8, maxScore: 10, passed: true, latePenaltyApplied: false,
      gradedAt: new Date('2026-01-01T00:00:01Z'),
    }),
    ...overrides,
  };
}

describe('AssessmentSubmissionFlowService', () => {
  describe('submitAndGrade', () => {
    it('runs submit -> grade -> persist in order and returns a confirmation shape', async () => {
      const attemptLifecycle = makeAttemptLifecycle();
      const gradingResult = {
        attemptId: 'att-1', assessmentId: 'a-1', studentId: 'stu-1',
        score: 8, maxScore: 10, passed: true, latePenaltyApplied: false,
        gradedAt: new Date('2026-01-01T00:00:01Z'), outcomes: [],
      };
      const grading = makeGradingService({ gradeAttempt: jest.fn().mockResolvedValue(gradingResult) });
      const result = makeResultService();
      const svc = new AssessmentSubmissionFlowService(attemptLifecycle as any, grading as any, result as any);

      const out = await svc.submitAndGrade('att-1', 'stu-1');

      expect(attemptLifecycle.submitAttempt).toHaveBeenCalledWith('att-1', 'stu-1');
      expect(grading.gradeAttempt).toHaveBeenCalledWith('att-1');
      expect(result.persistResult).toHaveBeenCalledWith(gradingResult);
      expect(out).toEqual({
        attemptId: 'att-1',
        status: 'graded',
        submittedAt: new Date('2026-01-01T00:00:00Z'),
        resultId: 'result-1',
      });
    });

    it('never returns score, maxScore, passed, or latePenaltyApplied to the caller', async () => {
      const svc = new AssessmentSubmissionFlowService(
        makeAttemptLifecycle() as any, makeGradingService() as any, makeResultService() as any,
      );
      const out = await svc.submitAndGrade('att-1', 'stu-1') as unknown as Record<string, unknown>;

      expect(out).not.toHaveProperty('score');
      expect(out).not.toHaveProperty('maxScore');
      expect(out).not.toHaveProperty('passed');
      expect(out).not.toHaveProperty('latePenaltyApplied');
    });

    it('propagates rejection if submitAttempt rejects (e.g. deadline closed) without grading', async () => {
      const attemptLifecycle = makeAttemptLifecycle({
        submitAttempt: jest.fn().mockRejectedValue(new Error('DEADLINE_BLOCKS_SUBMISSION')),
      });
      const grading = makeGradingService();
      const svc = new AssessmentSubmissionFlowService(attemptLifecycle as any, grading as any, makeResultService() as any);

      await expect(svc.submitAndGrade('att-1', 'stu-1')).rejects.toThrow('DEADLINE_BLOCKS_SUBMISSION');
      expect(grading.gradeAttempt).not.toHaveBeenCalled();
    });
  });
});
