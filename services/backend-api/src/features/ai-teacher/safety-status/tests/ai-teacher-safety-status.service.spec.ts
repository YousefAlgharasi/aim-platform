// P18-047: Create AI Safety Status API
// AiTeacherSafetyStatusService tests.

import { AiTeacherSafetyStatusService } from '../ai-teacher-safety-status.service';
import { AiSafetyEventRepository } from '../../repositories/ai-safety-event.repository';
import { AiSafetyEventRow } from '../../repositories/ai-chat-repository.types';

function makeEvent(overrides: Partial<AiSafetyEventRow> = {}): AiSafetyEventRow {
  return {
    id: 'event-1',
    session_id: 'session-1',
    direction: 'output',
    decision: 'allowed',
    reason_category: null,
    created_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

describe('AiTeacherSafetyStatusService', () => {
  function makeService(events: AiSafetyEventRow[]) {
    const repository = {
      findBySessionId: jest.fn().mockResolvedValue(events),
    } as unknown as AiSafetyEventRepository;
    const service = new AiTeacherSafetyStatusService(repository);
    return { service, repository };
  }

  it("returns status 'ok' when no events were ever rejected", async () => {
    const { service } = makeService([makeEvent(), makeEvent({ id: 'event-2' })]);

    const result = await service.getStatus('session-1');

    expect(result).toEqual({
      sessionId: 'session-1',
      status: 'ok',
      lastCheckedAt: '2026-06-19T00:00:00.000Z',
    });
  });

  it("returns status 'limited' as soon as any event was rejected", async () => {
    const { service } = makeService([
      makeEvent({ decision: 'rejected', reason_category: 'UNSAFE_CONTENT' }),
      makeEvent({ id: 'event-2' }),
    ]);

    const result = await service.getStatus('session-1');

    expect(result.status).toBe('limited');
  });

  it('returns a null lastCheckedAt and ok status when no safety events exist yet', async () => {
    const { service } = makeService([]);

    const result = await service.getStatus('session-1');

    expect(result).toEqual({ sessionId: 'session-1', status: 'ok', lastCheckedAt: null });
  });

  it('never exposes the raw reason_category taxonomy', async () => {
    const { service } = makeService([
      makeEvent({ decision: 'rejected', reason_category: 'LEARNING_AUTHORITY_VIOLATION' }),
    ]);

    const result = await service.getStatus('session-1');

    expect(JSON.stringify(result)).not.toMatch(/LEARNING_AUTHORITY_VIOLATION/);
  });
});
