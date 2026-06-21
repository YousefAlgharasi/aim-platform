// P18-055: Add AI Cost and Quota Tests
// AiCostQuotaService (P18-030) tests: budgets, quotas, denied generation,
// and the admin-facing listing/limit-status helpers (P18-050).

import { AiCostQuotaService } from '../ai-cost-quota.service';
import { AiUsageCostEventRepository } from '../ai-usage-cost-event.repository';
import { AiUsageCostEventRow } from '../governance-repository.types';

function makeEvent(overrides: Partial<AiUsageCostEventRow> = {}): AiUsageCostEventRow {
  return {
    id: 'event-1',
    student_id: 'student-1',
    event_type: 'text_generation',
    model_config_id: 'config-1',
    request_id: 'req-1',
    tokens_used: 100,
    duration_seconds: null,
    cost_estimate: '0.01',
    quota_period: 'daily',
    metadata: {},
    created_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

function makeRepository(overrides: Partial<Record<keyof AiUsageCostEventRepository, jest.Mock>> = {}) {
  return {
    create: jest.fn().mockImplementation((input) => Promise.resolve(makeEvent(input))),
    sumCostSince: jest.fn().mockResolvedValue(0),
    findByRequestId: jest.fn().mockResolvedValue(null),
    listRecent: jest.fn().mockResolvedValue([makeEvent()]),
    listByStudentId: jest.fn().mockResolvedValue([makeEvent()]),
    ...overrides,
  } as unknown as AiUsageCostEventRepository;
}

describe('AiCostQuotaService — budgets and quotas', () => {
  it('allows a request when projected spend stays within the daily budget', async () => {
    const repository = makeRepository({ sumCostSince: jest.fn().mockResolvedValue(1.0) });
    const service = new AiCostQuotaService(repository);

    const result = await service.checkQuota('student-1', 'daily', 0.5);

    expect(result.allowed).toBe(true);
    expect(result.periodSpend).toBe(1.0);
    expect(result.budget).toBe(2.0);
  });

  it('denies generation when projected spend would exceed the daily budget', async () => {
    const repository = makeRepository({ sumCostSince: jest.fn().mockResolvedValue(1.9) });
    const service = new AiCostQuotaService(repository);

    const result = await service.checkQuota('student-1', 'daily', 0.5);

    expect(result.allowed).toBe(false);
    expect(result.budget).toBe(2.0);
  });

  it('denies generation when projected spend would exceed the monthly budget', async () => {
    const repository = makeRepository({ sumCostSince: jest.fn().mockResolvedValue(29.5) });
    const service = new AiCostQuotaService(repository);

    const result = await service.checkQuota('student-1', 'monthly', 1.0);

    expect(result.allowed).toBe(false);
    expect(result.budget).toBe(30.0);
  });

  it('allows a request exactly at the budget boundary', async () => {
    const repository = makeRepository({ sumCostSince: jest.fn().mockResolvedValue(1.5) });
    const service = new AiCostQuotaService(repository);

    const result = await service.checkQuota('student-1', 'daily', 0.5);

    expect(result.allowed).toBe(true);
  });

  it('checks the quota window scoped to the requesting student only', async () => {
    const repository = makeRepository();
    const service = new AiCostQuotaService(repository);

    await service.checkQuota('student-1', 'daily', 0.1);

    expect(repository.sumCostSince).toHaveBeenCalledWith('student-1', expect.any(Date));
  });
});

describe('AiCostQuotaService — recording usage', () => {
  it('records a usage event after a provider call completes', async () => {
    const repository = makeRepository();
    const service = new AiCostQuotaService(repository);

    const result = await service.recordUsage({
      studentId: 'student-1',
      eventType: 'text_generation',
      modelConfigId: 'config-1',
      requestId: 'req-1',
      tokensUsed: 120,
      costEstimate: 0.01,
      quotaPeriod: 'daily',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'student-1', requestId: 'req-1' }),
    );
    expect(result.student_id).toBe('student-1');
  });
});

describe('AiCostQuotaService — admin listing and limit-status (P18-050)', () => {
  it('lists recent usage across all students', async () => {
    const repository = makeRepository();
    const service = new AiCostQuotaService(repository);

    await service.listRecentUsage(50);

    expect(repository.listRecent).toHaveBeenCalledWith(50);
  });

  it('lists usage scoped to one student', async () => {
    const repository = makeRepository();
    const service = new AiCostQuotaService(repository);

    await service.listUsageForStudent('student-1', 50);

    expect(repository.listByStudentId).toHaveBeenCalledWith('student-1', 50);
  });

  it('reports both daily and monthly limit status for a student', async () => {
    const repository = makeRepository({ sumCostSince: jest.fn().mockResolvedValue(1.0) });
    const service = new AiCostQuotaService(repository);

    const status = await service.getLimitStatusForStudent('student-1');

    expect(status.studentId).toBe('student-1');
    expect(status.daily.budget).toBe(2.0);
    expect(status.monthly.budget).toBe(30.0);
    expect(repository.sumCostSince).toHaveBeenCalledTimes(2);
  });

  it('never leaks mastery/weakness/difficulty/recommendation fields from a usage event', async () => {
    const repository = makeRepository();
    const service = new AiCostQuotaService(repository);

    const [event] = await service.listRecentUsage(10);

    expect(event).not.toHaveProperty('mastery');
    expect(event).not.toHaveProperty('weakness');
    expect(event).not.toHaveProperty('difficulty');
    expect(event).not.toHaveProperty('recommendation');
  });
});
