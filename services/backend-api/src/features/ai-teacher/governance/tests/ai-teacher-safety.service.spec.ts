// P18-054: Add AI Safety Tests
// AiTeacherSafetyService (P18-029) tests: blocked prompts, unsafe outputs,
// post-generation checks, minor-safety categories, and fail-closed
// escalation behavior.

import { AiTeacherSafetyService } from '../ai-teacher-safety.service';
import { AiTeacherSafetyCheckRepository } from '../ai-teacher-safety-check.repository';
import { AiTeacherProviderGateway } from '../ai-teacher-provider.interface';
import { AiTeacherSafetyCheckRow } from '../governance-repository.types';

function makeRecord(overrides: Partial<AiTeacherSafetyCheckRow> = {}): AiTeacherSafetyCheckRow {
  return {
    id: 'check-1',
    target_type: 'message',
    target_id: 'target-1',
    category: 'none',
    severity: 'low',
    action: 'allowed',
    metadata: {},
    created_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

function makeRepository() {
  return {
    create: jest.fn().mockImplementation((input) => Promise.resolve(makeRecord(input))),
  } as unknown as AiTeacherSafetyCheckRepository;
}

function makeGateway(moderate: AiTeacherProviderGateway['moderateContent']) {
  return {
    generateText: jest.fn(),
    transcribeSpeech: jest.fn(),
    synthesizeSpeech: jest.fn(),
    moderateContent: moderate,
  } as unknown as AiTeacherProviderGateway;
}

describe('AiTeacherSafetyService — blocked prompts (pre-generation input check)', () => {
  it('blocks a flagged student prompt before any provider generation call', async () => {
    const repository = makeRepository();
    const gateway = makeGateway(jest.fn().mockResolvedValue({ flagged: true, categories: ['violence'] }));
    const service = new AiTeacherSafetyService(repository, gateway);

    const outcome = await service.checkInput('message', 'message-1', 'how do I hurt someone', 'provider-ref-1');

    expect(outcome.action).toBe('blocked');
    expect(outcome.category).toBe('violence');
    expect(gateway.generateText).not.toHaveBeenCalled();
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ targetType: 'message', targetId: 'message-1', action: 'blocked', severity: 'high' }),
    );
  });

  it('allows a clean student prompt', async () => {
    const repository = makeRepository();
    const gateway = makeGateway(jest.fn().mockResolvedValue({ flagged: false, categories: [] }));
    const service = new AiTeacherSafetyService(repository, gateway);

    const outcome = await service.checkInput('message', 'message-1', 'how do fractions work?', 'provider-ref-1');

    expect(outcome.action).toBe('allowed');
    expect(outcome.category).toBe('none');
  });
});

describe('AiTeacherSafetyService — unsafe outputs / post-generation checks', () => {
  it('blocks a flagged generated response (post-generation check)', async () => {
    const repository = makeRepository();
    const gateway = makeGateway(jest.fn().mockResolvedValue({ flagged: true, categories: ['self-harm'] }));
    const service = new AiTeacherSafetyService(repository, gateway);

    const outcome = await service.checkOutput('message', 'message-1', 'generated reply text', 'provider-ref-1');

    expect(outcome.action).toBe('blocked');
    expect(outcome.category).toBe('self-harm');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { direction: 'output' } }),
    );
  });

  it('never persists the checked content itself, only category/action/metadata', async () => {
    const repository = makeRepository();
    const gateway = makeGateway(jest.fn().mockResolvedValue({ flagged: true, categories: ['self-harm'] }));
    const service = new AiTeacherSafetyService(repository, gateway);

    await service.checkOutput('message', 'message-1', 'sensitive generated reply text', 'provider-ref-1');

    const persistedPayload = (repository.create as jest.Mock).mock.calls[0][0];
    expect(JSON.stringify(persistedPayload)).not.toMatch(/sensitive generated reply text/);
  });

  it('allows a clean generated response', async () => {
    const repository = makeRepository();
    const gateway = makeGateway(jest.fn().mockResolvedValue({ flagged: false, categories: [] }));
    const service = new AiTeacherSafetyService(repository, gateway);

    const outcome = await service.checkOutput('message', 'message-1', 'a safe explanation', 'provider-ref-1');

    expect(outcome.action).toBe('allowed');
    expect(outcome.record.severity).toBe('low');
  });
});

describe('AiTeacherSafetyService — minor-safety categories', () => {
  it.each(['self-harm', 'suicide', 'sexual-minors', 'violence'])(
    'treats a flagged %s category as blocked with high severity',
    async (category) => {
      const repository = makeRepository();
      const gateway = makeGateway(jest.fn().mockResolvedValue({ flagged: true, categories: [category] }));
      const service = new AiTeacherSafetyService(repository, gateway);

      const outcome = await service.checkInput('message', 'message-1', 'content', 'provider-ref-1');

      expect(outcome.action).toBe('blocked');
      expect(outcome.record.severity).toBe('high');
    },
  );
});

describe('AiTeacherSafetyService — fail-closed escalation behavior', () => {
  it('blocks (never allows) when the moderation provider call throws', async () => {
    const repository = makeRepository();
    const gateway = makeGateway(jest.fn().mockRejectedValue(new Error('provider unavailable')));
    const service = new AiTeacherSafetyService(repository, gateway);

    const outcome = await service.checkInput('message', 'message-1', 'content', 'provider-ref-1');

    expect(outcome.action).toBe('blocked');
    expect(outcome.category).toBe('moderation_error');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'blocked', severity: 'high', category: 'moderation_error' }),
    );
  });

  it('blocks on a moderation timeout/failure for the output check too', async () => {
    const repository = makeRepository();
    const gateway = makeGateway(jest.fn().mockRejectedValue(new Error('timeout')));
    const service = new AiTeacherSafetyService(repository, gateway);

    const outcome = await service.checkOutput('voice_segment', 'segment-1', 'content', 'provider-ref-1');

    expect(outcome.action).toBe('blocked');
    expect(outcome.record.target_type).toBe('voice_segment');
  });

  it('falls back to an "unspecified" category when a flagged response has no categories', async () => {
    const repository = makeRepository();
    const gateway = makeGateway(jest.fn().mockResolvedValue({ flagged: true, categories: [] }));
    const service = new AiTeacherSafetyService(repository, gateway);

    const outcome = await service.checkInput('message', 'message-1', 'content', 'provider-ref-1');

    expect(outcome.action).toBe('blocked');
    expect(outcome.category).toBe('unspecified');
  });
});
