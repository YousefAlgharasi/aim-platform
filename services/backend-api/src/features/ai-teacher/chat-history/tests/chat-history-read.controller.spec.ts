// P8-073: Create Chat History API
// ChatHistoryReadController tests.

import { ChatHistoryReadController } from '../chat-history-read.controller';
import { ChatHistoryReadService } from '../chat-history-read.service';
import { GetChatHistoryResult } from '../chat-history-read.types';
import { AppError } from '../../../../common/errors/app-error';
import { AuthenticatedUser } from '../../../../auth/authenticated-user';

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return { id: 'student-1', email: 'student@example.com', ...overrides } as AuthenticatedUser;
}

function makeResult(overrides: Partial<GetChatHistoryResult> = {}): GetChatHistoryResult {
  return {
    sessionId: 'session-1',
    messages: [{ id: 'message-1', role: 'student', text: 'hello', createdAt: '2026-06-19T00:00:00.000Z' }],
    ...overrides,
  };
}

describe('ChatHistoryReadController', () => {
  function makeController(result: GetChatHistoryResult | null = makeResult()) {
    const service = {
      getHistory: jest.fn().mockResolvedValue(result),
    } as unknown as ChatHistoryReadService;
    const controller = new ChatHistoryReadController(service);
    return { controller, service };
  }

  it('resolves studentId from the authenticated user, never from the route', async () => {
    const { controller, service } = makeController();

    await controller.getHistory(makeUser({ id: 'student-1' }), 'session-1');

    expect(service.getHistory).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'session-1',
    });
  });

  it('returns the service result unchanged', async () => {
    const result = makeResult({ sessionId: 'session-42' });
    const { controller } = makeController(result);

    await expect(controller.getHistory(makeUser(), 'session-42')).resolves.toEqual(result);
  });

  it('throws NOT_FOUND when the service returns null', async () => {
    const { controller, service } = makeController(null);

    await expect(controller.getHistory(makeUser(), 'missing-session')).rejects.toThrow(AppError);
    expect(service.getHistory).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'missing-session',
    });
  });
});
