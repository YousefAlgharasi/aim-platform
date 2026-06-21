// P18-048: Create Admin AI Prompt Management API
// AdminPromptController + CreatePromptTemplateDraftDto tests.

import { AdminPromptController } from '../admin-prompt.controller';
import { PromptTemplateService } from '../../governance/prompt-template.service';
import { AiPromptTemplateRow } from '../../governance/governance-repository.types';
import { CreatePromptTemplateDraftDto } from '../admin-prompt.dto';
import { AppError } from '../../../../common/errors/app-error';

function makeTemplate(overrides: Partial<AiPromptTemplateRow> = {}): AiPromptTemplateRow {
  return {
    id: 'template-1',
    name: 'lesson_help',
    version: 1,
    locale: 'en',
    audience: 'student',
    status: 'draft',
    body: 'Explain the concept patiently.',
    safety_tags: {},
    created_at: '2026-06-19T00:00:00.000Z',
    updated_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

describe('CreatePromptTemplateDraftDto.fromBody', () => {
  it('returns a trimmed dto when all required fields are present', () => {
    expect(
      CreatePromptTemplateDraftDto.fromBody({
        name: ' lesson_help ',
        locale: ' en ',
        audience: ' student ',
        body: 'Explain patiently.',
      }),
    ).toEqual({
      name: 'lesson_help',
      locale: 'en',
      audience: 'student',
      body: 'Explain patiently.',
      safetyTags: undefined,
    });
  });

  it.each([
    {},
    { name: '', locale: 'en', audience: 'student', body: 'x' },
    { name: 'x', locale: '', audience: 'student', body: 'x' },
    { name: 'x', locale: 'en', audience: '', body: 'x' },
    { name: 'x', locale: 'en', audience: 'student', body: '' },
    null,
  ])('throws an AppError VALIDATION_ERROR for invalid body %p', (body) => {
    expect(() => CreatePromptTemplateDraftDto.fromBody(body)).toThrow(AppError);
  });
});

describe('AdminPromptController', () => {
  function makeController() {
    const service = {
      listAllTemplates: jest.fn().mockResolvedValue([makeTemplate()]),
      getTemplateById: jest.fn().mockResolvedValue(makeTemplate()),
      createDraftTemplate: jest.fn().mockResolvedValue(makeTemplate()),
      publishTemplate: jest.fn().mockResolvedValue(makeTemplate({ status: 'active' })),
      retireTemplate: jest.fn().mockResolvedValue(makeTemplate({ status: 'retired' })),
    } as unknown as PromptTemplateService;
    const controller = new AdminPromptController(service);
    return { controller, service };
  }

  it('lists all templates regardless of status', async () => {
    const { controller, service } = makeController();
    await expect(controller.listAll()).resolves.toEqual([makeTemplate()]);
    expect(service.listAllTemplates).toHaveBeenCalled();
  });

  it('reads one template by id', async () => {
    const { controller, service } = makeController();
    await controller.getById('template-1');
    expect(service.getTemplateById).toHaveBeenCalledWith('template-1');
  });

  it('creates a draft from a validated body, never trusting a client-supplied version/status', async () => {
    const { controller, service } = makeController();
    await controller.createDraft({
      name: 'lesson_help',
      locale: 'en',
      audience: 'student',
      body: 'Explain patiently.',
    });
    expect(service.createDraftTemplate).toHaveBeenCalledWith({
      name: 'lesson_help',
      locale: 'en',
      audience: 'student',
      body: 'Explain patiently.',
      safetyTags: undefined,
    });
  });

  it('publishes a template by id', async () => {
    const { controller, service } = makeController();
    const result = await controller.publish('template-1');
    expect(service.publishTemplate).toHaveBeenCalledWith('template-1');
    expect(result.status).toBe('active');
  });

  it('retires a template by id', async () => {
    const { controller, service } = makeController();
    const result = await controller.retire('template-1');
    expect(service.retireTemplate).toHaveBeenCalledWith('template-1');
    expect(result.status).toBe('retired');
  });
});
