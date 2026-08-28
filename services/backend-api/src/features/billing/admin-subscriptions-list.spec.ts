import { SubscriptionService } from './subscription.service';

describe('Admin subscriptions listing', () => {
  describe('SubscriptionService.listAllSubscriptions', () => {
    it('delegates to the repository with paging and returns free-tier rows unfiltered', async () => {
      const mockRepo = {
        listAllSubscriptionsWithStudentNames: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'sub-1',
              userId: 'user-1',
              studentName: 'Jane Student',
              planId: 'plan-free',
              status: 'active',
              currentPeriodStart: null,
              currentPeriodEnd: null,
              cancelAtPeriodEnd: false,
              createdAt: '2026-01-01T00:00:00.000Z',
            },
            {
              id: 'sub-2',
              userId: 'user-2',
              studentName: null,
              planId: 'plan-pro',
              status: 'active',
              currentPeriodStart: '2026-01-01T00:00:00.000Z',
              currentPeriodEnd: '2026-02-01T00:00:00.000Z',
              cancelAtPeriodEnd: false,
              createdAt: '2026-01-02T00:00:00.000Z',
            },
          ],
          total: 2,
          page: 1,
          limit: 50,
        }),
      };

      const service = new SubscriptionService(
        mockRepo as never,
        {} as never,
        { ingest: jest.fn() } as never,
      );

      const result = await service.listAllSubscriptions(1, 50);

      expect(mockRepo.listAllSubscriptionsWithStudentNames).toHaveBeenCalledWith(1, 50);
      expect(result.total).toBe(2);
      // A free-plan subscription must be included, not filtered out.
      expect(result.data.some((s) => s.planId === 'plan-free')).toBe(true);
      // Student name resolved via the users/student_profiles join.
      expect(result.data[0].studentName).toBe('Jane Student');
      // Falls back to null (rendered as the raw ID client-side) when no name is found.
      expect(result.data[1].studentName).toBeNull();
    });
  });

  describe('AdminBillingController route ordering', () => {
    it('registers the static "subscriptions" list route before the "subscriptions/:userId" route', () => {
      // Nest matches routes in declaration order; the list endpoint must be
      // declared first or it would be shadowed by the ":userId" param route
      // and admin/billing/subscriptions would 404/never be reached.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const source = require('fs').readFileSync(
        require('path').join(__dirname, 'admin-billing.controller.ts'),
        'utf8',
      );
      const listIndex = source.indexOf(`@Get('subscriptions')`);
      const byUserIndex = source.indexOf(`@Get('subscriptions/:userId')`);
      expect(listIndex).toBeGreaterThan(-1);
      expect(byUserIndex).toBeGreaterThan(-1);
      expect(listIndex).toBeLessThan(byUserIndex);
    });
  });
});
