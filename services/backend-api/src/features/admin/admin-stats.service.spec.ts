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

describe('AdminStatsService billing (course payments)', () => {
  it('reports real money from approved course payments and keeps pending separate', async () => {
    const db = createDb((sql) => {
      if (sql.includes('GROUP BY currency')) {
        return { rows: [{ currency: 'YER', total: '30000.00', this_month: '18000.00', pending_amount: '10000.00' }] };
      }
      if (sql.includes('FROM course_access')) {
        return { rows: [{ active: '2', completed: '1', failed: '0', expiring: '1' }] };
      }
      if (sql.includes('FROM course_payment_requests')) {
        return { rows: [{ approved: '3', pending: '1', rejected: '1', paying: '2' }] };
      }
      return { rows: [{ count: '0' }] };
    });
    const service = new AdminStatsService(db as never);
    const billing = await (service as unknown as { getBillingStats: () => Promise<Record<string, unknown>> }).getBillingStats();
    expect(billing).toMatchObject({
      currencies: [{ currency: 'YER', totalRevenue: 30000, revenueThisMonth: 18000, pendingAmount: 10000 }],
      approvedPayments: 3,
      pendingPayments: 1,
      payingStudents: 2,
      access: { active: 2, completed: 1, failed: 0, expiringWithin7Days: 1 },
    });
  });

  it('falls back to zeros instead of failing the whole dashboard', async () => {
    const db = { query: jest.fn().mockRejectedValue(new Error('boom')) };
    const service = new AdminStatsService(db as never);
    const billing = await (service as unknown as { getBillingStats: () => Promise<{ currencies: unknown[]; approvedPayments: number }> }).getBillingStats();
    expect(billing.currencies).toEqual([]);
    expect(billing.approvedPayments).toBe(0);
  });
});
