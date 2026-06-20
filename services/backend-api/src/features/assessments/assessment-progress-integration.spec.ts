/**
 * Assessment Progress Integration Tests — Phase 10, P10-070.
 *
 * Verifies that only backend-approved grading results affect progress/AIM.
 * Extends the P10-069 unit tests with deeper integration-level assertions.
 *
 * Invariants tested:
 *   1. Only backend-computed values (score, maxScore, passed) are recorded.
 *   2. Progress events contain correct fields: assessmentId, attemptId,
 *      studentId, score, maxScore, passed, latePenaltyApplied, gradedAt.
 *   3. Failed grading does NOT produce a progress event (tested via
 *      submission flow — grading failure prevents progress call).
 *   4. Progress recording failure does NOT affect attempt submission result.
 *   5. No client data (answers, selectedOptionId, etc.) leaks into events.
 *   6. The service only accepts server-side grading outcomes.
 */

import {
  AssessmentProgressIntegrationService,
  AssessmentProgressEvent,
  AssessmentProgressOutcome,
} from './assessment-progress-integration.service';
import { AssessmentSubmissionFlowService } from './assessment-submission-flow.service';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const STUDENT_ID = 'aaaaaaaa-0000-4000-8000-000000000001';
const ASSESSMENT_ID = 'bbbbbbbb-0000-4000-8000-000000000002';
const ATTEMPT_ID = 'cccccccc-0000-4000-8000-000000000003';
const RESULT_ID = 'dddddddd-0000-4000-8000-000000000004';

function makeEvent(overrides: Partial<AssessmentProgressEvent> = {}): AssessmentProgressEvent {
  return {
    assessmentId: ASSESSMENT_ID,
    attemptId: ATTEMPT_ID,
    studentId: STUDENT_ID,
    score: 85,
    maxScore: 100,
    passed: true,
    latePenaltyApplied: false,
    gradedAt: new Date('2026-06-20T10:30:00.000Z'),
    ...overrides,
  };
}

/** Simulated client submission data — must NEVER appear in progress events. */
const CLIENT_DATA_FIELDS = [
  'answers',
  'selectedOptionId',
  'textResponse',
  'clientTimestamp',
  'userAgent',
  'clientScore',
  'clientPassed',
  'questionId',
  'optionsPresentedCount',
  'answerFormat',
  'answerValue',
  'isCorrect',
] as const;

// ---------------------------------------------------------------------------
// Submission flow mock helpers
// ---------------------------------------------------------------------------

function makeGradingResult() {
  return {
    assessmentId: ASSESSMENT_ID,
    attemptId: ATTEMPT_ID,
    studentId: STUDENT_ID,
    score: 85,
    maxScore: 100,
    passed: true,
    latePenaltyApplied: false,
    gradedAt: new Date('2026-06-20T10:30:00.000Z'),
  };
}

function makeMockAttemptLifecycle() {
  return {
    submitAttempt: jest.fn().mockResolvedValue({
      attemptId: ATTEMPT_ID,
      submittedAt: new Date('2026-06-20T10:30:00.000Z'),
    }),
  } as any;
}

function makeMockGradingService(result = makeGradingResult()) {
  return {
    gradeAttempt: jest.fn().mockResolvedValue(result),
  } as any;
}

function makeMockResultService() {
  return {
    persistResult: jest.fn().mockResolvedValue({ resultId: RESULT_ID }),
  } as any;
}

// ---------------------------------------------------------------------------
// Tests — AssessmentProgressIntegrationService (direct)
// ---------------------------------------------------------------------------

describe('Assessment Progress Integration — P10-070', () => {
  let svc: AssessmentProgressIntegrationService;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    svc = new AssessmentProgressIntegrationService();
    // Suppress logger output in tests
    logSpy = jest.spyOn((svc as any).logger, 'log').mockImplementation();
    jest.spyOn((svc as any).logger, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1. Only backend-computed values are recorded
  // -------------------------------------------------------------------------

  describe('only backend-computed values are recorded', () => {
    it('records score from server-side grading result', async () => {
      const result = await svc.recordAssessmentResult(makeEvent({ score: 72, maxScore: 100 }));
      expect(result.recorded).toBe(true);
    });

    it('records passed status from server-side grading result', async () => {
      const result = await svc.recordAssessmentResult(makeEvent({ passed: false }));
      expect(result.recorded).toBe(true);
    });

    it('backend-computed score is used even if extra client fields are present on the object', async () => {
      // TypeScript prevents this at compile time, but at runtime someone could
      // spread client data onto the event. The service must not propagate extras.
      const eventWithExtras = {
        ...makeEvent({ score: 85 }),
        clientScore: 999,
        answers: [{ questionId: 'q1', selectedOptionId: 'opt-a' }],
      } as unknown as AssessmentProgressEvent;

      const result = await svc.recordAssessmentResult(eventWithExtras);
      expect(result.recorded).toBe(true);
      // The logger.log call receives only backend fields
      const loggedPayload = logSpy.mock.calls[0]?.[1];
      expect(loggedPayload).toBeDefined();
      expect(loggedPayload.score).toBe(85);
      expect(loggedPayload).not.toHaveProperty('clientScore');
      expect(loggedPayload).not.toHaveProperty('answers');
    });
  });

  // -------------------------------------------------------------------------
  // 2. Progress events contain correct fields
  // -------------------------------------------------------------------------

  describe('progress event contains correct fields', () => {
    it('logged payload has assessmentId', async () => {
      await svc.recordAssessmentResult(makeEvent());
      expect(logSpy.mock.calls[0][1].assessmentId).toBe(ASSESSMENT_ID);
    });

    it('logged payload has attemptId', async () => {
      await svc.recordAssessmentResult(makeEvent());
      expect(logSpy.mock.calls[0][1].attemptId).toBe(ATTEMPT_ID);
    });

    it('logged payload has studentId', async () => {
      await svc.recordAssessmentResult(makeEvent());
      expect(logSpy.mock.calls[0][1].studentId).toBe(STUDENT_ID);
    });

    it('logged payload has score and maxScore', async () => {
      await svc.recordAssessmentResult(makeEvent({ score: 42, maxScore: 50 }));
      const payload = logSpy.mock.calls[0][1];
      expect(payload.score).toBe(42);
      expect(payload.maxScore).toBe(50);
    });

    it('logged payload has passed', async () => {
      await svc.recordAssessmentResult(makeEvent({ passed: false }));
      expect(logSpy.mock.calls[0][1].passed).toBe(false);
    });

    it('logged payload has latePenaltyApplied', async () => {
      await svc.recordAssessmentResult(makeEvent({ latePenaltyApplied: true }));
      expect(logSpy.mock.calls[0][1].latePenaltyApplied).toBe(true);
    });

    it('logged payload has gradedAt as ISO string', async () => {
      const gradedAt = new Date('2026-06-20T11:00:00.000Z');
      await svc.recordAssessmentResult(makeEvent({ gradedAt }));
      expect(logSpy.mock.calls[0][1].gradedAt).toBe('2026-06-20T11:00:00.000Z');
    });

    it('logged payload has exactly the expected keys', async () => {
      await svc.recordAssessmentResult(makeEvent());
      const keys = Object.keys(logSpy.mock.calls[0][1]).sort();
      expect(keys).toEqual([
        'assessmentId',
        'attemptId',
        'gradedAt',
        'latePenaltyApplied',
        'maxScore',
        'passed',
        'score',
        'studentId',
      ]);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Failed grading does NOT produce a progress event
  //    (tested at submission flow level — grading throws before progress call)
  // -------------------------------------------------------------------------

  describe('failed grading does not produce a progress event', () => {
    it('submission flow does not call progress integration when grading throws', async () => {
      const progressSvc = new AssessmentProgressIntegrationService();
      const recordSpy = jest.spyOn(progressSvc, 'recordAssessmentResult');

      const gradingService = {
        gradeAttempt: jest.fn().mockRejectedValue(new Error('Grading failed: no answers found')),
      } as any;

      const flow = new AssessmentSubmissionFlowService(
        makeMockAttemptLifecycle(),
        gradingService,
        makeMockResultService(),
        progressSvc,
      );

      await expect(flow.submitAndGrade(ATTEMPT_ID, STUDENT_ID)).rejects.toThrow('Grading failed');
      expect(recordSpy).not.toHaveBeenCalled();
    });

    it('submission flow does not call progress integration when result persistence throws', async () => {
      const progressSvc = new AssessmentProgressIntegrationService();
      const recordSpy = jest.spyOn(progressSvc, 'recordAssessmentResult');

      const resultService = {
        persistResult: jest.fn().mockRejectedValue(new Error('DB constraint violation')),
      } as any;

      const flow = new AssessmentSubmissionFlowService(
        makeMockAttemptLifecycle(),
        makeMockGradingService(),
        resultService,
        progressSvc,
      );

      await expect(flow.submitAndGrade(ATTEMPT_ID, STUDENT_ID)).rejects.toThrow('DB constraint');
      expect(recordSpy).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // 4. Progress recording failure does NOT affect attempt submission result
  // -------------------------------------------------------------------------

  describe('progress recording failure does not affect submission result', () => {
    it('recordAssessmentResult never throws — returns recorded: false on internal error', async () => {
      // Force the logger.log to throw (simulating an internal failure)
      logSpy.mockImplementation(() => { throw new Error('Logger crashed'); });

      const result = await svc.recordAssessmentResult(makeEvent());
      expect(result.recorded).toBe(false);
      expect(result.attemptId).toBe(ATTEMPT_ID);
      expect(result.studentId).toBe(STUDENT_ID);
    });

    it('submission flow succeeds even when progress integration throws', async () => {
      const progressSvc = new AssessmentProgressIntegrationService();
      jest.spyOn(progressSvc, 'recordAssessmentResult').mockRejectedValue(
        new Error('Progress recording catastrophic failure'),
      );

      const flow = new AssessmentSubmissionFlowService(
        makeMockAttemptLifecycle(),
        makeMockGradingService(),
        makeMockResultService(),
        progressSvc,
      );

      const result = await flow.submitAndGrade(ATTEMPT_ID, STUDENT_ID);
      expect(result.status).toBe('graded');
      expect(result.attemptId).toBe(ATTEMPT_ID);
      expect(result.resultId).toBe(RESULT_ID);
    });

    it('submission flow returns correct shape regardless of progress failure', async () => {
      const progressSvc = new AssessmentProgressIntegrationService();
      jest.spyOn(progressSvc, 'recordAssessmentResult').mockRejectedValue(
        new Error('Network timeout'),
      );

      const flow = new AssessmentSubmissionFlowService(
        makeMockAttemptLifecycle(),
        makeMockGradingService(),
        makeMockResultService(),
        progressSvc,
      );

      const result = await flow.submitAndGrade(ATTEMPT_ID, STUDENT_ID);
      expect(result).toEqual({
        attemptId: ATTEMPT_ID,
        status: 'graded',
        submittedAt: expect.any(Date),
        resultId: RESULT_ID,
      });
    });

    it('outcome always contains attemptId and studentId even on failure', async () => {
      logSpy.mockImplementation(() => { throw new Error('crash'); });

      const result = await svc.recordAssessmentResult(makeEvent());
      expect(result.attemptId).toBe(ATTEMPT_ID);
      expect(result.studentId).toBe(STUDENT_ID);
    });
  });

  // -------------------------------------------------------------------------
  // 5. No client data leaks into progress events
  // -------------------------------------------------------------------------

  describe('no client data leaks into progress events', () => {
    for (const field of CLIENT_DATA_FIELDS) {
      it(`progress logged payload does not contain ${field}`, async () => {
        await svc.recordAssessmentResult(makeEvent());
        const payload = logSpy.mock.calls[0][1];
        expect(payload).not.toHaveProperty(field);
      });
    }

    it('extra properties on the event object are not forwarded to the logger', async () => {
      const eventWithExtras = {
        ...makeEvent(),
        answers: [{ questionId: 'q1', selectedOptionId: 'opt-a' }],
        clientScore: 999,
        userAgent: 'attacker-browser',
        clientPassed: true,
        textResponse: 'hacked answer',
      } as unknown as AssessmentProgressEvent;

      await svc.recordAssessmentResult(eventWithExtras);

      const payload = logSpy.mock.calls[0][1];
      expect(Object.keys(payload).sort()).toEqual([
        'assessmentId',
        'attemptId',
        'gradedAt',
        'latePenaltyApplied',
        'maxScore',
        'passed',
        'score',
        'studentId',
      ]);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Service only accepts server-side grading outcomes
  // -------------------------------------------------------------------------

  describe('service only accepts server-side grading outcomes', () => {
    it('submission flow passes only grading result fields to progress service', async () => {
      const progressSvc = new AssessmentProgressIntegrationService();
      const recordSpy = jest.spyOn(progressSvc, 'recordAssessmentResult').mockResolvedValue({
        recorded: true,
        attemptId: ATTEMPT_ID,
        studentId: STUDENT_ID,
      });
      jest.spyOn((progressSvc as any).logger, 'log').mockImplementation();

      const flow = new AssessmentSubmissionFlowService(
        makeMockAttemptLifecycle(),
        makeMockGradingService(),
        makeMockResultService(),
        progressSvc,
      );

      await flow.submitAndGrade(ATTEMPT_ID, STUDENT_ID);

      expect(recordSpy).toHaveBeenCalledTimes(1);
      const passedEvent = recordSpy.mock.calls[0][0];
      expect(passedEvent).toEqual({
        assessmentId: ASSESSMENT_ID,
        attemptId: ATTEMPT_ID,
        studentId: STUDENT_ID,
        score: 85,
        maxScore: 100,
        passed: true,
        latePenaltyApplied: false,
        gradedAt: new Date('2026-06-20T10:30:00.000Z'),
      });
    });

    it('studentId in progress event always matches grading result studentId', async () => {
      const customStudentId = 'eeeeeeee-0000-4000-8000-000000000099';
      await svc.recordAssessmentResult(makeEvent({ studentId: customStudentId }));
      expect(logSpy.mock.calls[0][1].studentId).toBe(customStudentId);
    });

    it('score=0 edge case is handled correctly', async () => {
      await svc.recordAssessmentResult(makeEvent({ score: 0, passed: false }));
      const payload = logSpy.mock.calls[0][1];
      expect(payload.score).toBe(0);
      expect(payload.passed).toBe(false);
    });

    it('perfect score edge case is handled correctly', async () => {
      await svc.recordAssessmentResult(makeEvent({ score: 100, maxScore: 100, passed: true }));
      const payload = logSpy.mock.calls[0][1];
      expect(payload.score).toBe(100);
      expect(payload.maxScore).toBe(100);
    });

    it('late penalty grading result is forwarded correctly', async () => {
      await svc.recordAssessmentResult(makeEvent({
        latePenaltyApplied: true,
        score: 72,
        gradedAt: new Date('2026-06-20T11:00:00.000Z'),
      }));
      const payload = logSpy.mock.calls[0][1];
      expect(payload.latePenaltyApplied).toBe(true);
      expect(payload.score).toBe(72);
    });
  });
});
