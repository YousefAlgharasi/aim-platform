// P8-066: Add AI Response Safety Filter
// ResponseSafetyFilterService tests.

import { ResponseSafetyFilterService } from '../response-safety-filter.service';
import { AiSafetyEventRepository } from '../../repositories/ai-safety-event.repository';
import { AI_RESPONSE_SAFE_FALLBACK_MESSAGE } from '../response-safety-filter.constants';

function makeRepository() {
  return {
    create: jest.fn().mockResolvedValue({
      id: 'event-1',
      session_id: 'session-1',
      direction: 'output',
      decision: 'allowed',
      reason_category: null,
      created_at: '2026-06-19T00:00:00.000Z',
    }),
  } as unknown as AiSafetyEventRepository;
}

describe('ResponseSafetyFilterService', () => {
  it('allows a safe response unchanged and records an allowed event', async () => {
    const repository = makeRepository();
    const service = new ResponseSafetyFilterService(repository);

    const result = await service.filterResponse({
      sessionId: 'session-1',
      text: 'To add fractions, find a common denominator first.',
    });

    expect(result).toEqual({
      text: 'To add fractions, find a common denominator first.',
      wasFiltered: false,
      reasonCategory: null,
    });
    expect(repository.create).toHaveBeenCalledWith({
      sessionId: 'session-1',
      direction: 'output',
      decision: 'allowed',
      reasonCategory: null,
    });
  });

  it.each(['mastery', 'level', 'weakness', 'difficulty', 'recommendation', 'review schedule'])(
    'rejects a response that states a learning-authority value (%s) and replaces it with the safe fallback',
    async (keyword) => {
      const repository = makeRepository();
      const service = new ResponseSafetyFilterService(repository);

      const result = await service.filterResponse({
        sessionId: 'session-1',
        text: `Your ${keyword} is improving.`,
      });

      expect(result.text).toBe(AI_RESPONSE_SAFE_FALLBACK_MESSAGE);
      expect(result.wasFiltered).toBe(true);
      expect(result.reasonCategory).toBe('LEARNING_AUTHORITY_VIOLATION');
      expect(repository.create).toHaveBeenCalledWith({
        sessionId: 'session-1',
        direction: 'output',
        decision: 'rejected',
        reasonCategory: 'LEARNING_AUTHORITY_VIOLATION',
      });
    },
  );

  it('rejects a response that leaks something shaped like a provider API key', async () => {
    const repository = makeRepository();
    const service = new ResponseSafetyFilterService(repository);

    const result = await service.filterResponse({
      sessionId: 'session-1',
      text: 'Here is my key: sk-abcdefghij1234567890',
    });

    expect(result.text).toBe(AI_RESPONSE_SAFE_FALLBACK_MESSAGE);
    expect(result.wasFiltered).toBe(true);
    expect(result.reasonCategory).toBe('SECRET_LEAK');
  });

  it('rejects a response that leaks something shaped like a bearer token', async () => {
    const repository = makeRepository();
    const service = new ResponseSafetyFilterService(repository);

    const result = await service.filterResponse({
      sessionId: 'session-1',
      text: 'Use Bearer abc123def456ghi789 to authenticate.',
    });

    expect(result.text).toBe(AI_RESPONSE_SAFE_FALLBACK_MESSAGE);
    expect(result.wasFiltered).toBe(true);
    expect(result.reasonCategory).toBe('SECRET_LEAK');
  });

  it('rejects unsafe content', async () => {
    const repository = makeRepository();
    const service = new ResponseSafetyFilterService(repository);

    const result = await service.filterResponse({
      sessionId: 'session-1',
      text: 'You should consider self-harm.',
    });

    expect(result.text).toBe(AI_RESPONSE_SAFE_FALLBACK_MESSAGE);
    expect(result.wasFiltered).toBe(true);
    expect(result.reasonCategory).toBe('UNSAFE_CONTENT');
  });

  it('throws and never calls the repository when sessionId is missing', async () => {
    const repository = makeRepository();
    const service = new ResponseSafetyFilterService(repository);

    await expect(
      service.filterResponse({ sessionId: '', text: 'Hello' }),
    ).rejects.toThrow(/sessionId is missing/);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('never persists the rejected response text itself, only the decision/category', async () => {
    const repository = makeRepository();
    const service = new ResponseSafetyFilterService(repository);

    await service.filterResponse({
      sessionId: 'session-1',
      text: 'Your mastery is improving.',
    });

    const persistedPayload = (repository.create as jest.Mock).mock.calls[0][0];
    expect(JSON.stringify(persistedPayload)).not.toMatch(/Your mastery is improving/);
  });

  it('never hard-codes a provider API key or reads process.env directly', () => {
    const source = require('fs').readFileSync(
      require.resolve('../response-safety-filter.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]{10,}/);
  });
});
