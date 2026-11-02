import { SubscriptionService } from './subscription.service';

describe('billing overview: course sales', () => {
  it('includes approved course payments (revenue, pending, per course) next to card revenue', async () => {
    const repo = {
      countActiveSubscriptions: jest.fn().mockResolvedValue(2),
      getRevenueMtdByCurrency: jest.fn().mockResolvedValue([]),
      countPendingRefunds: jest.fn().mockResolvedValue(0),
      countRecentFailedPayments: jest.fn().mockResolvedValue(0),
      getCourseSalesByCurrency: jest.fn().mockResolvedValue([
        { currency: 'YER', revenueMtd: 18000, revenueAllTime: 18000, discountsGiven: 2000, approvedThisMonth: 2, approvedTotal: 2, pendingCount: 1, pendingAmount: 10000, rejectedCount: 0 },
      ]),
      getCourseSalesByCourse: jest.fn().mockResolvedValue([
        { courseId: 'c1', title: 'Starter', currency: 'YER', payments: 2, revenue: 18000 },
      ]),
    };
    const svc = new SubscriptionService(repo as any, {} as any, {} as any);
    const overview = await svc.getOverview();
    expect(overview.courseSales.byCurrency[0]).toMatchObject({ currency: 'YER', revenueMtd: 18000, pendingCount: 1 });
    expect(overview.courseSales.byCourse[0]).toMatchObject({ title: 'Starter', revenue: 18000 });
    expect(overview.activeSubscriptions).toBe(2); // existing fields untouched
  });
});
