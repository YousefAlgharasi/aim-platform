import { CourseBillingOverviewService } from './course-billing-overview.service';

describe('CourseBillingOverviewService', () => {
  it('builds totals, per-course/wallet/month revenue, access summary and recent payments', async () => {
    const db = {
      query: jest.fn(async (sql: string) => {
        if (sql.includes('rev_today')) {
          return { rows: [{ currency: 'YER', rev_today: '8000', rev_mtd: '18000', rev_last: '5000', rev_all: '23000',
            approved_total: '3', approved_mtd: '2', avg_payment: '7666.666', discounts: '2000',
            pending_count: '1', pending_amount: '10000', rejected_count: '1' }] };
        }
        if (sql.includes('JOIN courses co ON co.id = p.course_id') && sql.includes('GROUP BY co.id')) {
          return { rows: [{ course_id: 'c1', title: 'Starter', currency: 'YER', payments: '3', revenue: '23000' }] };
        }
        if (sql.includes('GROUP BY w.id')) return { rows: [{ wallet_id: 'w1', name: 'Jawali', currency: 'YER', payments: '3', revenue: '23000' }] };
        if (sql.includes("to_char(date_trunc('month'")) return { rows: [{ month: '2026-11', currency: 'YER', payments: '2', revenue: '18000' }] };
        if (sql.includes('FROM course_access')) return { rows: [{ active: '2', expiring: '1', completed: '1', failed: '0' }] };
        if (sql.includes('COUNT(DISTINCT student_id)')) return { rows: [{ count: '2' }] };
        if (sql.includes('ORDER BY p.created_at DESC')) {
          return { rows: [{ id: 'p1', student_email: 's@x.com', course_title: 'Starter', wallet_name: 'Jawali', amount: '8000', currency: 'YER', status: 'approved', created_at: '2026-11-02T10:00:00Z', reviewed_at: '2026-11-02T11:00:00Z' }] };
        }
        return { rows: [] };
      }),
    };
    const overview = await new CourseBillingOverviewService(db as never).getOverview();
    expect(overview.currencies[0]).toMatchObject({ currency: 'YER', revenueToday: 8000, revenueMtd: 18000, revenueLastMonth: 5000, revenueAllTime: 23000, approvedTotal: 3, averagePayment: 7666.67, pendingAmount: 10000 });
    expect(overview.byCourse[0]).toMatchObject({ title: 'Starter', revenue: 23000, payments: 3 });
    expect(overview.byWallet[0]).toMatchObject({ name: 'Jawali', revenue: 23000 });
    expect(overview.monthly[0]).toMatchObject({ month: '2026-11', revenue: 18000 });
    expect(overview.access).toEqual({ active: 2, expiringWithin7Days: 1, completed: 1, failed: 0 });
    expect(overview.payingStudents).toBe(2);
    expect(overview.recent[0]).toMatchObject({ studentEmail: 's@x.com', status: 'approved', amount: 8000 });
  });

  it('only approved payments count as revenue (SQL filters on status)', async () => {
    const seen: string[] = [];
    const db = { query: jest.fn(async (sql: string) => { seen.push(sql); return { rows: [] }; }) };
    await new CourseBillingOverviewService(db as never).getOverview();
    const revenueQueries = seen.filter((q) => q.includes('SUM(amount)') && !q.includes("status = 'pending'"));
    expect(revenueQueries.length).toBeGreaterThan(0);
    for (const q of revenueQueries) expect(q).toContain("status = 'approved'");
  });
});
