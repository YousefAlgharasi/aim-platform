// P10-028: AssessmentScorePolicyService unit tests.

import { AssessmentScorePolicyService } from './assessment-score-policy.service';
import { AssessmentGradingResult } from './assessment-score-policy.service';

// Re-export type alias so tests compile without the P10-027 branch file

function makeDb(passThreshold = 60) {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [{ pass_threshold: passThreshold }],
    }),
  };
}

function makeGradingResult(
  score: number,
  maxScore: number,
  latePenaltyApplied = false,
): AssessmentGradingResult {
  return {
    attemptId: 'att-1',
    assessmentId: 'asmnt-1',
    studentId: 'stu-1',
    score,
    maxScore,
    passed: false, // policy re-derives this
    latePenaltyApplied,
    gradedAt: new Date(),
    outcomes: [],
  };
}

describe('AssessmentScorePolicyService', () => {
  it('passes when scorePercent meets threshold', async () => {
    const svc = new AssessmentScorePolicyService(makeDb(60) as any);
    const result = await svc.applyPolicy({
      gradingResult: makeGradingResult(70, 100),
    });
    expect(result.passed).toBe(true);
    expect(result.scorePercent).toBe(70);
  });

  it('fails when scorePercent is below threshold', async () => {
    const svc = new AssessmentScorePolicyService(makeDb(75) as any);
    const result = await svc.applyPolicy({
      gradingResult: makeGradingResult(70, 100),
    });
    expect(result.passed).toBe(false);
  });

  it('propagates latePenaltyApplied from grading result', async () => {
    const svc = new AssessmentScorePolicyService(makeDb(60) as any);
    const result = await svc.applyPolicy({
      gradingResult: makeGradingResult(80, 100, true),
    });
    expect(result.latePenaltyApplied).toBe(true);
  });

  it('defaults to 60% threshold when settings row missing', async () => {
    const db = { query: jest.fn().mockResolvedValue({ rows: [] }) };
    const svc = new AssessmentScorePolicyService(db as any);
    const result = await svc.applyPolicy({
      gradingResult: makeGradingResult(59, 100),
    });
    expect(result.passed).toBe(false); // 59 < 60
  });

  it('never accepts threshold from outside — only from DB', async () => {
    // applyPolicy takes ScorePolicyInput with no threshold field
    const svc = new AssessmentScorePolicyService(makeDb(80) as any);
    const input = { gradingResult: makeGradingResult(70, 100) };
    expect(Object.keys(input)).not.toContain('passThreshold');
    const result = await svc.applyPolicy(input);
    expect(result.passed).toBe(false); // 70 < 80 from DB
  });
});
