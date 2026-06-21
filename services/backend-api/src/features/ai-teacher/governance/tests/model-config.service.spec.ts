// P18-055: Add AI Cost and Quota Tests
// ModelConfigService (P18-028/P18-049) tests: model tiering selection,
// safe-view never leaking provider secrets, and admin status/limits
// management.

import { NotFoundException } from '@nestjs/common';

import { ModelConfigService } from '../model-config.service';
import { AiModelConfigRepository } from '../ai-model-config.repository';
import { AiModelConfigRow } from '../governance-repository.types';

function makeConfig(overrides: Partial<AiModelConfigRow> = {}): AiModelConfigRow {
  return {
    id: 'config-1',
    name: 'gpt-economy',
    provider_key_ref: 'provider-key-ref-1',
    model_id: 'gpt-x',
    tier: 'economy',
    status: 'active',
    limits: { maxTokens: 500 },
    parameters: { temperature: 0.7 },
    created_at: '2026-06-19T00:00:00.000Z',
    updated_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

function makeRepository(overrides: Partial<Record<keyof AiModelConfigRepository, jest.Mock>> = {}) {
  return {
    listActiveByTier: jest.fn().mockResolvedValue([makeConfig()]),
    findById: jest.fn().mockResolvedValue(makeConfig()),
    listAll: jest.fn().mockResolvedValue([makeConfig()]),
    updateStatus: jest.fn().mockResolvedValue(makeConfig({ status: 'retired' })),
    updateLimitsAndParameters: jest.fn().mockResolvedValue(
      makeConfig({ limits: { maxTokens: 100 }, parameters: { temperature: 0.5 } }),
    ),
    ...overrides,
  } as unknown as AiModelConfigRepository;
}

describe('ModelConfigService — model tiering', () => {
  it('selects the first active config for a tier', async () => {
    const repository = makeRepository();
    const service = new ModelConfigService(repository);

    const config = await service.selectByTier('economy');

    expect(repository.listActiveByTier).toHaveBeenCalledWith('economy');
    expect(config.tier).toBe('economy');
  });

  it('throws NotFoundException when no active config exists for a tier', async () => {
    const repository = makeRepository({ listActiveByTier: jest.fn().mockResolvedValue([]) });
    const service = new ModelConfigService(repository);

    await expect(service.selectByTier('premium')).rejects.toThrow(NotFoundException);
  });

  it.each(['economy', 'standard', 'premium'] as const)(
    'requests configs for the %s tier specifically, never a different tier',
    async (tier) => {
      const repository = makeRepository();
      const service = new ModelConfigService(repository);

      await service.selectByTier(tier);

      expect(repository.listActiveByTier).toHaveBeenCalledWith(tier);
    },
  );
});

describe('ModelConfigService — safe view never leaks secrets', () => {
  it('toSafeView strips provider_key_ref and parameters, keeping only id/name/tier/limits', () => {
    const repository = makeRepository();
    const service = new ModelConfigService(repository);

    const safeView = service.toSafeView(makeConfig());

    expect(safeView).toEqual({ id: 'config-1', name: 'gpt-economy', tier: 'economy', limits: { maxTokens: 500 } });
    expect(safeView).not.toHaveProperty('provider_key_ref');
    expect(safeView).not.toHaveProperty('parameters');
  });
});

describe('ModelConfigService — getById', () => {
  it('throws NotFoundException for a missing config id', async () => {
    const repository = makeRepository({ findById: jest.fn().mockResolvedValue(null) });
    const service = new ModelConfigService(repository);

    await expect(service.getById('missing-id')).rejects.toThrow(NotFoundException);
  });
});

describe('ModelConfigService — admin status/limits management (P18-049)', () => {
  it('lists all configs regardless of status', async () => {
    const repository = makeRepository();
    const service = new ModelConfigService(repository);

    await service.listAllConfigs();

    expect(repository.listAll).toHaveBeenCalled();
  });

  it('changes status via setStatus', async () => {
    const repository = makeRepository();
    const service = new ModelConfigService(repository);

    const result = await service.setStatus('config-1', 'retired');

    expect(repository.updateStatus).toHaveBeenCalledWith('config-1', 'retired');
    expect(result.status).toBe('retired');
  });

  it('throws NotFoundException when setStatus targets a missing config', async () => {
    const repository = makeRepository({ updateStatus: jest.fn().mockResolvedValue(null) });
    const service = new ModelConfigService(repository);

    await expect(service.setStatus('missing-id', 'retired')).rejects.toThrow(NotFoundException);
  });

  it('updates limits and parameters', async () => {
    const repository = makeRepository();
    const service = new ModelConfigService(repository);

    const result = await service.updateLimitsAndParameters('config-1', { maxTokens: 100 }, { temperature: 0.5 });

    expect(repository.updateLimitsAndParameters).toHaveBeenCalledWith(
      'config-1',
      { maxTokens: 100 },
      { temperature: 0.5 },
    );
    expect(result.limits).toEqual({ maxTokens: 100 });
  });

  it('throws NotFoundException when updateLimitsAndParameters targets a missing config', async () => {
    const repository = makeRepository({ updateLimitsAndParameters: jest.fn().mockResolvedValue(null) });
    const service = new ModelConfigService(repository);

    await expect(
      service.updateLimitsAndParameters('missing-id', {}, {}),
    ).rejects.toThrow(NotFoundException);
  });
});
