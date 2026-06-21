// P18-049: Create Admin AI Model Config API
// AdminModelConfigController + DTO tests.

import { AdminModelConfigController } from '../admin-model-config.controller';
import { ModelConfigService } from '../../governance/model-config.service';
import { AiModelConfigRow } from '../../governance/governance-repository.types';
import { UpdateModelConfigLimitsDto, UpdateModelConfigStatusDto } from '../admin-model-config.dto';
import { AppError } from '../../../../common/errors/app-error';

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

describe('UpdateModelConfigStatusDto.fromBody', () => {
  it('returns a dto for a valid status', () => {
    expect(UpdateModelConfigStatusDto.fromBody({ status: 'retired' })).toEqual({
      status: 'retired',
    });
  });

  it.each([{}, { status: 'unknown' }, { status: 123 }, null])(
    'throws an AppError VALIDATION_ERROR for invalid body %p',
    (body) => {
      expect(() => UpdateModelConfigStatusDto.fromBody(body)).toThrow(AppError);
    },
  );
});

describe('UpdateModelConfigLimitsDto.fromBody', () => {
  it('returns a dto when limits and parameters are objects', () => {
    expect(
      UpdateModelConfigLimitsDto.fromBody({ limits: { maxTokens: 100 }, parameters: { temperature: 0.5 } }),
    ).toEqual({ limits: { maxTokens: 100 }, parameters: { temperature: 0.5 } });
  });

  it.each([
    {},
    { limits: 'x', parameters: {} },
    { limits: {}, parameters: 'x' },
    { limits: [], parameters: {} },
    null,
  ])('throws an AppError VALIDATION_ERROR for invalid body %p', (body) => {
    expect(() => UpdateModelConfigLimitsDto.fromBody(body)).toThrow(AppError);
  });
});

describe('AdminModelConfigController', () => {
  function makeController() {
    const service = {
      listAllConfigs: jest.fn().mockResolvedValue([makeConfig()]),
      getById: jest.fn().mockResolvedValue(makeConfig()),
      setStatus: jest.fn().mockResolvedValue(makeConfig({ status: 'retired' })),
      updateLimitsAndParameters: jest.fn().mockResolvedValue(
        makeConfig({ limits: { maxTokens: 100 }, parameters: { temperature: 0.5 } }),
      ),
    } as unknown as ModelConfigService;
    const controller = new AdminModelConfigController(service);
    return { controller, service };
  }

  it('lists all model configs regardless of status', async () => {
    const { controller, service } = makeController();
    await expect(controller.listAll()).resolves.toEqual([makeConfig()]);
    expect(service.listAllConfigs).toHaveBeenCalled();
  });

  it('reads one model config by id', async () => {
    const { controller, service } = makeController();
    await controller.getById('config-1');
    expect(service.getById).toHaveBeenCalledWith('config-1');
  });

  it('never returns a provider secret, only provider_key_ref', async () => {
    const { controller } = makeController();
    const result = await controller.getById('config-1');
    expect(result.provider_key_ref).toBe('provider-key-ref-1');
    expect(result).not.toHaveProperty('apiKey');
    expect(result).not.toHaveProperty('secret');
  });

  it('changes status via a validated body', async () => {
    const { controller, service } = makeController();
    const result = await controller.setStatus('config-1', { status: 'retired' });
    expect(service.setStatus).toHaveBeenCalledWith('config-1', 'retired');
    expect(result.status).toBe('retired');
  });

  it('updates limits and parameters via a validated body', async () => {
    const { controller, service } = makeController();
    await controller.updateLimits('config-1', { limits: { maxTokens: 100 }, parameters: { temperature: 0.5 } });
    expect(service.updateLimitsAndParameters).toHaveBeenCalledWith(
      'config-1',
      { maxTokens: 100 },
      { temperature: 0.5 },
    );
  });
});
