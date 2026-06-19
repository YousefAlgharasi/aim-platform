// P8-074: Create Chat Session List API
// ChatSessionListReadController tests.

import { ChatSessionListReadController } from '../chat-session-list-read.controller';
import { ChatSessionListReadService } from '../chat-session-list-read.service';
import { ListChatSessionsResult } from '../chat-session-list-read.types';
import { AuthenticatedUser } from '../../../../auth/authenticated-user';

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return { id: 'student-1', email: 'student@example.com', ...overrides } as AuthenticatedUser;
}

function makeResult(overrides: Partial<ListChatSessionsResult> = {}): ListChatSessionsResult {
  return {
    sessions: [
      {
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
        status: 'active',
        createdAt: '2026-06-19T00:00:00.000Z',
        updatedAt: '2026-06-19T00:00:00.000Z',
      },
    ],
    ...overrides,
  };
}

describe('ChatSessionListReadController', () => {
  function makeController(result: ListChatSessionsResult = makeResult()) {
    const service = {
      listSessions: jest.fn().mockResolvedValue(result),
    } as unknown as ChatSessionListReadService;
    const controller = new ChatSessionListReadController(service);
    return { controller, service };
  }

  it('resolves studentId from the authenticated user', async () => {
    const { controller, service } = makeController();

    await controller.listSessions(makeUser({ id: 'student-1' }));

    expect(service.listSessions).toHaveBeenCalledWith({ studentId: 'student-1' });
  });

  it('returns the service result unchanged', async () => {
    const result = makeResult({ sessions: [] });
    const { controller } = makeController(result);

    await expect(controller.listSessions(makeUser())).resolves.toEqual(result);
  });
});
