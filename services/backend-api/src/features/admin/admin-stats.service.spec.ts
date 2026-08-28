import { AdminStatsService } from './admin-stats.service';

function createDb(handler: (sql: string) => { rows: Record<string, unknown>[] }) {
  return {
    query: jest.fn().mockImplementation((sql: string) => Promise.resolve(handler(sql))),
  };
}

describe('AdminStatsService', () => {
  it('computes assessment attempts and average score from score/max_score', async () => {
    const db = createDb((sql) => {
      if (sql.includes('FROM assessment_results')) {
        return { rows: [{ count: '89', avg: '87.5' }] };
      }
      if (sql.includes('FROM assessments')) {
        return { rows: [{ count: '89' }] };
      }
      return { rows: [{ count: '0' }] };
    });
    const service = new AdminStatsService(db as never);

    const result = await (service as unknown as {
      getAssessmentStats: () => Promise<{ total: number; attempts: number; avgScore: number | null }>;
    }).getAssessmentStats();

    expect(result).toEqual({ total: 89, attempts: 89, avgScore: 87.5 });
    const attemptsQuery = db.query.mock.calls.find(([sql]) =>
      typeof sql === 'string' && sql.includes('FROM assessment_results'),
    )?.[0] as string;
    expect(attemptsQuery).toContain('score / max_score * 100');
    expect(attemptsQuery).not.toContain('score_percentage');
  });

  it('returns zero attempts and null average when there are no results', async () => {
    const db = createDb((sql) => {
      if (sql.includes('FROM assessment_results')) {
        return { rows: [{ count: '0', avg: null }] };
      }
      return { rows: [{ count: '0' }] };
    });
    const service = new AdminStatsService(db as never);

    const result = await (service as unknown as {
      getAssessmentStats: () => Promise<{ total: number; attempts: number; avgScore: number | null }>;
    }).getAssessmentStats();

    expect(result).toEqual({ total: 0, attempts: 0, avgScore: null });
  });
});
