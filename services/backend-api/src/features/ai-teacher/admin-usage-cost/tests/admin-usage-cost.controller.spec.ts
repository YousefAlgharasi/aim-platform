// P18-050: Create Admin AI Usage and Cost API
// AdminUsageCostController tests.

import { AdminUsageCostController } from '../admin-usage-cost.controller';
import { AiCostQuotaService } from '../../governance/ai-cost-quota.service';
import { AiUsageCostEventRow } from '../../governance/governance-repository.types';

function makeEvent(overrides: Partial<AiUsageCostEventRow> = {}): AiUsageCostEventRow {
  return {
    id: 'event-1',
    student_id: 'student-1',
    event_type: 'text_generation',
    model_config_id: 'config-1',
    request_id: 'req-1',
    tokens_used: 120,
    duration_seconds: null,
    cost_estimate: '0.01',
    quota_period: 'daily',
    metadata: {},
    created_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

describe('AdminUsageCostController', () => {
  function makeController() {
    const service = {
      listRecentUsage: jest.fn().mockResolvedValue([makeEvent()]),
      listUsageForStudent: jest.fn().mockResolvedValue([makeEvent()]),
      getLimitStatusForStudent: jest.fn().mockResolvedValue({
        studentId: 'student-1',
        daily: { allowed: true, periodSpend: 0.01, budget: 2.0 },
        monthly: { allowed: true, periodSpend: 0.01, budget: 30.0 },
      }),
    } as unknown as AiCostQuotaService;
    const controller = new AdminUsageCostController(service);
    return { controller, service };
  }

  it('lists recent usage with a default limit', async () => {
    const { controller, service } = makeController();
    await controller.listRecent();
    expect(service.listRecentUsage).toHaveBeenCalledWith(100);
  });

  it('caps the limit query param at 500', async () => {
    const { controller, service } = makeController();
    await controller.listRecent('9999');
    expect(service.listRecentUsage).toHaveBeenCalledWith(500);
  });

  it('falls back to the default limit for an invalid query param', async () => {
    const { controller, service } = makeController();
    await controller.listRecent('not-a-number');
    expect(service.listRecentUsage).toHaveBeenCalledWith(100);
  });

  it('lists usage for a single student', async () => {
    const { controller, service } = makeController();
    await controller.listForStudent('student-1');
    expect(service.listUsageForStudent).toHaveBeenCalledWith('student-1', 100);
  });

  it('returns daily/monthly limit status for a student', async () => {
    const { controller, service } = makeController();
    const result = await controller.getLimitStatus('student-1');
    expect(service.getLimitStatusForStudent).toHaveBeenCalledWith('student-1');
    expect(result.daily.allowed).toBe(true);
    expect(result.monthly.allowed).toBe(true);
  });

  it('never leaks mastery/weakness/difficulty/recommendation fields', async () => {
    const { controller } = makeController();
    const [event] = await controller.listRecent();
    expect(event).not.toHaveProperty('mastery');
    expect(event).not.toHaveProperty('weakness');
    expect(event).not.toHaveProperty('difficulty');
    expect(event).not.toHaveProperty('recommendation');
  });
});
