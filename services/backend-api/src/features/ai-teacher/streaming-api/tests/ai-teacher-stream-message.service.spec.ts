// P18-043: Create AI Streaming Message API
// AiTeacherStreamMessageService tests.

import { AiTeacherStreamMessageService } from '../ai-teacher-stream-message.service';
import { AiTeacherOrchestratorService } from '../../orchestrator/ai-teacher-orchestrator.service';
import { ChatTurnResult } from '../../orchestrator/ai-teacher-orchestrator.types';

function makeResult(overrides: Partial<ChatTurnResult> = {}): ChatTurnResult {
  return {
    text: 'Add the numerators when denominators match.',
    isFallback: false,
    provider: 'fake-provider',
    model: 'fake-model',
    latencyMs: 12,
    ...overrides,
  };
}

describe('AiTeacherStreamMessageService', () => {
  function makeService(result: ChatTurnResult = makeResult()) {
    const orchestrator = {
      handleTurn: jest.fn().mockResolvedValue(result),
    } as unknown as AiTeacherOrchestratorService;
    const service = new AiTeacherStreamMessageService(orchestrator);
    return { service, orchestrator };
  }

  async function collect<T>(generator: AsyncGenerator<T>): Promise<T[]> {
    const events: T[] = [];
    for await (const event of generator) {
      events.push(event);
    }
    return events;
  }

  it('runs the full safety-checked turn before emitting any chunk', async () => {
    const { service, orchestrator } = makeService();

    const events = await collect(
      service.streamTurn({
        studentId: 'student-1',
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
        studentMessage: 'How do I add fractions?',
      }),
    );

    expect(orchestrator.handleTurn).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'session-1',
      contextRef: 'lesson:fractions',
      studentMessage: 'How do I add fractions?',
    });
    expect(events[events.length - 1]).toEqual({
      type: 'done',
      isFallback: false,
      provider: 'fake-provider',
      model: 'fake-model',
    });
  });

  it('chunks the already safety-filtered reply text and reassembles to the original text', async () => {
    const text = 'A reasonably long AI Teacher reply used to exercise chunk boundaries.';
    const { service } = makeService(makeResult({ text }));

    const events = await collect(
      service.streamTurn(
        {
          studentId: 'student-1',
          sessionId: 'session-1',
          contextRef: 'lesson:fractions',
          studentMessage: 'hello',
        },
        10,
      ),
    );

    const chunks = events.filter((event) => event.type === 'chunk');
    const reassembled = chunks.map((chunk) => (chunk as { text: string }).text).join('');

    expect(reassembled).toBe(text);
    expect(chunks.length).toBeGreaterThan(1);
    expect(events[events.length - 1].type).toBe('done');
  });

  it('marks the stream as a fallback when the underlying turn falls back', async () => {
    const { service } = makeService(makeResult({ isFallback: true }));

    const events = await collect(
      service.streamTurn({
        studentId: 'student-1',
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
        studentMessage: 'hello',
      }),
    );

    const done = events[events.length - 1] as { type: 'done'; isFallback: boolean };
    expect(done.isFallback).toBe(true);
  });

  it('never references mastery, level, weakness, difficulty, or recommendation values', async () => {
    const { service } = makeService();

    const events = await collect(
      service.streamTurn({
        studentId: 'student-1',
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
        studentMessage: 'hello',
      }),
    );

    const serialized = JSON.stringify(events);
    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
  });
});
