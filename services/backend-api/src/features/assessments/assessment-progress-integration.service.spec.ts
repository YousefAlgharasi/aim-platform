// P10-069: AssessmentProgressIntegrationService unit tests.

import { AssessmentProgressIntegrationService, AssessmentProgressEvent } from './assessment-progress-integration.service';

function makeEvent(overrides: Partial<AssessmentProgressEvent> = {}): AssessmentProgressEvent {
  return {
    assessmentId: 'a-1',
    attemptId: 'att-1',
    studentId: 'stu-1',
    score: 8,
    maxScore: 10,
    passed: true,
    latePenaltyApplied: false,
    gradedAt: new Date('2026-01-01T00:00:01Z'),
    ...overrides,
  };
}

describe('AssessmentProgressIntegrationService', () => {
  let svc: AssessmentProgressIntegrationService;

  beforeEach(() => {
    svc = new AssessmentProgressIntegrationService();
  });

  it('records a backend-graded assessment result and returns recorded: true', async () => {
    const result = await svc.recordAssessmentResult(makeEvent());

    expect(result).toEqual({
      recorded: true,
      attemptId: 'att-1',
      studentId: 'stu-1',
    });
  });

  it('includes all required fields in the event', async () => {
    const event = makeEvent({ score: 5, maxScore: 20, passed: false });
    const result = await svc.recordAssessmentResult(event);

    expect(result.recorded).toBe(true);
  });

  it('handles a failed attempt (passed: false) without error', async () => {
    const result = await svc.recordAssessmentResult(makeEvent({ passed: false, score: 2 }));

    expect(result).toEqual({
      recorded: true,
      attemptId: 'att-1',
      studentId: 'stu-1',
    });
  });

  it('handles late penalty applied', async () => {
    const result = await svc.recordAssessmentResult(makeEvent({ latePenaltyApplied: true }));

    expect(result.recorded).toBe(true);
  });
});
