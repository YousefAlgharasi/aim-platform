// P10-037 / P10-069: AssessmentSubmissionFlowService unit tests.

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
    findByAttemptId: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

function makeProgressIntegration(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    recordAssessmentResult: jest.fn().mockResolvedValue({
      recorded: true, attemptId: 'att-1', studentId: 'stu-1',
    }),
    ...overrides,
  };
}

function makeAimBridge() {
  return { bridgeGradedAttempt: jest.fn().mockResolvedValue(undefined) };
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
      const progress = makeProgressIntegration();
      const svc = new AssessmentSubmissionFlowService(attemptLifecycle as any, grading as any, result as any, progress as any, makeAimBridge() as any);

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
        makeAttemptLifecycle() as any, makeGradingService() as any, makeResultService() as any, makeProgressIntegration() as any, makeAimBridge() as any,
      );
      const out = await svc.submitAndGrade('att-1', 'stu-1') as unknown as Record<string, unknown>;

      expect(out).not.toHaveProperty('score');
      expect(out).not.toHaveProperty('maxScore');
      expect(out).not.toHaveProperty('passed');
      expect(out).not.toHaveProperty('latePenaltyApplied');
    });

    // Bugfix: submitAttempt used to hard-throw ATTEMPT_ALREADY_SUBMITTED
    // purely from attempt.status, so a crash between the status flip and
    // result persistence left the student permanently stuck — unable to
    // retry (blocked by the status check) and unable to see a result
    // (none was ever persisted). Gating on whether a result actually
    // exists makes the retry recoverable.
    it('rejects as a genuine duplicate only when a result already exists, without calling submitAttempt or grading', async () => {
      const attemptLifecycle = makeAttemptLifecycle();
      const grading = makeGradingService();
      const result = makeResultService({
        findByAttemptId: jest.fn().mockResolvedValue({
          resultId: 'result-1', attemptId: 'att-1', assessmentId: 'a-1', studentId: 'stu-1',
          score: 8, maxScore: 10, passed: true, latePenaltyApplied: false,
          gradedAt: new Date('2026-01-01T00:00:01Z'),
        }),
      });
      const svc = new AssessmentSubmissionFlowService(
        attemptLifecycle as any, grading as any, result as any, makeProgressIntegration() as any, makeAimBridge() as any,
      );

      await expect(svc.submitAndGrade('att-1', 'stu-1')).rejects.toThrow('has already been submitted');
      expect(attemptLifecycle.submitAttempt).not.toHaveBeenCalled();
      expect(grading.gradeAttempt).not.toHaveBeenCalled();
    });

    it('recovers a submitted-but-never-graded attempt (e.g. a crash mid-pipeline) by re-running grading and persistence', async () => {
      // submitAttempt itself no longer throws for an already-submitted
      // attempt — it returns the existing submittedAt (see
      // AttemptLifecycleService.submitAttempt) — so the flow can safely
      // resume grading when no result exists yet.
      const attemptLifecycle = makeAttemptLifecycle();
      const result = makeResultService({ findByAttemptId: jest.fn().mockResolvedValue(null) });
      const svc = new AssessmentSubmissionFlowService(
        attemptLifecycle as any, makeGradingService() as any, result as any, makeProgressIntegration() as any, makeAimBridge() as any,
      );

      const out = await svc.submitAndGrade('att-1', 'stu-1');

      expect(out.status).toBe('graded');
      expect(out.resultId).toBe('result-1');
    });

    it('propagates rejection if submitAttempt rejects (e.g. deadline closed) without grading', async () => {
      const attemptLifecycle = makeAttemptLifecycle({
        submitAttempt: jest.fn().mockRejectedValue(new Error('DEADLINE_BLOCKS_SUBMISSION')),
      });
      const grading = makeGradingService();
      const svc = new AssessmentSubmissionFlowService(attemptLifecycle as any, grading as any, makeResultService() as any, makeProgressIntegration() as any, makeAimBridge() as any);

      await expect(svc.submitAndGrade('att-1', 'stu-1')).rejects.toThrow('DEADLINE_BLOCKS_SUBMISSION');
      expect(grading.gradeAttempt).not.toHaveBeenCalled();
    });

    // P10-069: Progress integration tests
    it('calls progressIntegration.recordAssessmentResult after successful grading', async () => {
      const progress = makeProgressIntegration();
      const svc = new AssessmentSubmissionFlowService(
        makeAttemptLifecycle() as any, makeGradingService() as any, makeResultService() as any, progress as any, makeAimBridge() as any,
      );

      await svc.submitAndGrade('att-1', 'stu-1');

      expect(progress.recordAssessmentResult).toHaveBeenCalledWith({
        assessmentId: 'a-1',
        attemptId: 'att-1',
        studentId: 'stu-1',
        score: 8,
        maxScore: 10,
        passed: true,
        latePenaltyApplied: false,
        gradedAt: new Date('2026-01-01T00:00:01Z'),
      });
    });

    // Bugfix: assessment answers never reached the AIM pipeline at all —
    // only lesson-practice session attempts did. Every graded question
    // must now be fed to AimAttemptBridgeService via AssessmentAimBridgeService.
    it('bridges the grading result into the AIM pipeline', async () => {
      const aimBridge = makeAimBridge();
      const gradingResult = {
        attemptId: 'att-1', assessmentId: 'a-1', studentId: 'stu-1',
        score: 8, maxScore: 10, passed: true, latePenaltyApplied: false,
        gradedAt: new Date('2026-01-01T00:00:01Z'), outcomes: [],
      };
      const grading = makeGradingService({ gradeAttempt: jest.fn().mockResolvedValue(gradingResult) });
      const svc = new AssessmentSubmissionFlowService(
        makeAttemptLifecycle() as any, grading as any, makeResultService() as any, makeProgressIntegration() as any, aimBridge as any,
      );

      await svc.submitAndGrade('att-1', 'stu-1');

      expect(aimBridge.bridgeGradedAttempt).toHaveBeenCalledWith(gradingResult, expect.any(String));
    });

    it('still returns confirmation even if the AIM bridge throws', async () => {
      const aimBridge = { bridgeGradedAttempt: jest.fn().mockRejectedValue(new Error('bridge exploded')) };
      const svc = new AssessmentSubmissionFlowService(
        makeAttemptLifecycle() as any, makeGradingService() as any, makeResultService() as any, makeProgressIntegration() as any, aimBridge as any,
      );

      const out = await svc.submitAndGrade('att-1', 'stu-1');
      expect(out.status).toBe('graded');
    });

    it('still returns confirmation even if progress integration throws', async () => {
      const progress = makeProgressIntegration({
        recordAssessmentResult: jest.fn().mockRejectedValue(new Error('PROGRESS_UNAVAILABLE')),
      });
      const svc = new AssessmentSubmissionFlowService(
        makeAttemptLifecycle() as any, makeGradingService() as any, makeResultService() as any, progress as any, makeAimBridge() as any,
      );

      const out = await svc.submitAndGrade('att-1', 'stu-1');

      expect(out).toEqual({
        attemptId: 'att-1',
        status: 'graded',
        submittedAt: new Date('2026-01-01T00:00:00Z'),
        resultId: 'result-1',
      });
    });
  });
});
