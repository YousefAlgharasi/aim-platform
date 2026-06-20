// P10-029: AssessmentResultService unit tests.

import { ConflictException } from '@nestjs/common';
import { AssessmentResultService } from './assessment-result.service';
import { AssessmentGradingResult } from './assessment-result.service';

function makeGrading(overrides: Partial<AssessmentGradingResult> = {}): AssessmentGradingResult {
  return {
    attemptId: 'att-1',
    assessmentId: 'asmnt-1',
    studentId: 'stu-1',
    score: 80,
    maxScore: 100,
    passed: true,
    latePenaltyApplied: false,
    gradedAt: new Date('2026-06-20T10:26:00Z'),
    outcomes: [
      { assessmentQuestionLinkId: 'ql-1', isCorrect: true, pointsAwarded: 5, pointsPossible: 5 },
    ],
    ...overrides,
  };
}

function makeDb(opts: { conflict?: boolean } = {}) {
  const client = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      if (sql.includes('BEGIN') || sql.includes('COMMIT') || sql.includes('ROLLBACK') || sql.includes('UPDATE')) {
        return { rows: [] };
      }
      if (sql.includes('INSERT INTO assessment_results')) {
        if (opts.conflict) {
          const err: NodeJS.ErrnoException = new Error('duplicate');
          (err as unknown as { code: string }).code = '23505';
          throw err;
        }
        return { rows: [{ id: 'result-1', graded_at: new Date() }] };
      }
      if (sql.includes('INSERT INTO assessment_result_breakdowns')) {
        return { rows: [] };
      }
      return { rows: [] };
    }),
    release: jest.fn(),
  };
  return {
    withClient: jest.fn(async (cb: (c: typeof client) => Promise<unknown>) => cb(client)),
    query: jest.fn(async () => ({ rows: [] })),
  };
}

describe('AssessmentResultService', () => {
  it('persists result and returns resultId', async () => {
    const svc = new AssessmentResultService(makeDb() as any);
    const result = await svc.persistResult(makeGrading());
    expect(result.resultId).toBe('result-1');
    expect(result.passed).toBe(true);
    expect(result.score).toBe(80);
  });

  it('throws ConflictException on duplicate result', async () => {
    const svc = new AssessmentResultService(makeDb({ conflict: true }) as any);
    await expect(svc.persistResult(makeGrading())).rejects.toThrow(ConflictException);
  });

  it('findByAttemptId returns null when no result', async () => {
    const db = { withClient: jest.fn(), query: jest.fn().mockResolvedValue({ rows: [] }) };
    const svc = new AssessmentResultService(db as any);
    const result = await svc.findByAttemptId('att-x', 'stu-1');
    expect(result).toBeNull();
  });

  it('findByAttemptId returns result when found', async () => {
    const db = {
      withClient: jest.fn(),
      query: jest.fn().mockResolvedValue({
        rows: [{
          id: 'r-1', attempt_id: 'att-1', assessment_id: 'a-1',
          student_id: 'stu-1', score: '75.00', max_score: '100.00',
          passed: false, late_penalty_applied: false, graded_at: new Date(),
        }],
      }),
    };
    const svc = new AssessmentResultService(db as any);
    const result = await svc.findByAttemptId('att-1', 'stu-1');
    expect(result?.resultId).toBe('r-1');
    expect(result?.score).toBe(75);
  });
});
