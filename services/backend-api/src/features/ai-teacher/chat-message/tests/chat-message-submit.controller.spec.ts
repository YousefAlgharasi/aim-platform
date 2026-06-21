// P8-072: Create Send Message API
// ChatMessageSubmitController + SendChatMessageRequestDto tests.

import { ChatMessageSubmitController } from '../chat-message-submit.controller';
import { ChatMessageSubmitService } from '../chat-message-submit.service';
import { AiChatSessionRepository } from '../../repositories/ai-chat-session.repository';
import { AiChatSessionRow } from '../../repositories/ai-chat-repository.types';
import { SendChatMessageRequestDto } from '../chat-message-submit.dto';
import { SubmitStudentMessageResult } from '../chat-message-submit.types';
import { AppError } from '../../../../common/errors/app-error';
import { AuthenticatedUser } from '../../../../auth/authenticated-user';

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return { id: 'student-1', email: 'student@example.com', ...overrides } as AuthenticatedUser;
}

function makeSessionRow(overrides: Partial<AiChatSessionRow> = {}): AiChatSessionRow {
  return {
    id: 'session-1',
    student_id: 'student-1',
    context_ref: 'lesson:fractions',
    status: 'active',
    created_at: '2026-06-19T00:00:00.000Z',
    updated_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

function makeMessageResult(
  overrides: Partial<SubmitStudentMessageResult> = {},
): SubmitStudentMessageResult {
  return {
    text: "Great question! Let's break it down.",
    isFallback: false,
    provider: 'fake-provider',
    model: 'fake-model',
    latencyMs: 120,
    ...overrides,
  };
}

describe('SendChatMessageRequestDto.fromBody', () => {
  it('returns a trimmed message when present and non-blank', () => {
    expect(SendChatMessageRequestDto.fromBody({ message: '  hello  ' })).toEqual({
      message: 'hello',
    });
  });

  it.each([{ message: '' }, { message: '   ' }, {}, null, undefined, 'string-body', 42])(
    'throws an AppError VALIDATION_ERROR for invalid body %p',
    (body) => {
      expect(() => SendChatMessageRequestDto.fromBody(body)).toThrow(AppError);
    },
  );
});

describe('ChatMessageSubmitController', () => {
  function makeController(
    sessionRow: AiChatSessionRow | null = makeSessionRow(),
    messageResult: SubmitStudentMessageResult = makeMessageResult(),
  ) {
    const service = {
      submitMessage: jest.fn().mockResolvedValue(messageResult),
    } as unknown as ChatMessageSubmitService;
    const repository = {
      findById: jest.fn().mockResolvedValue(sessionRow),
    } as unknown as AiChatSessionRepository;
    const controller = new ChatMessageSubmitController(service, repository);
    return { controller, service, repository };
  }

  it('resolves studentId from the authenticated user and contextRef from the session row', async () => {
    const { controller, service, repository } = makeController();
    const user = makeUser({ id: 'student-1' });

    await controller.sendMessage(user, 'session-1', { message: 'hello' });

    expect(repository.findById).toHaveBeenCalledWith('session-1');
    expect(service.submitMessage).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'session-1',
      contextRef: 'lesson:fractions',
      studentMessage: 'hello',
    });
  });

  it('returns the service result unchanged', async () => {
    const result = makeMessageResult({ text: 'custom reply' });
    const { controller } = makeController(makeSessionRow(), result);

    await expect(
      controller.sendMessage(makeUser(), 'session-1', { message: 'hello' }),
    ).resolves.toEqual(result);
  });

  it('rejects with NOT_FOUND when the session does not exist', async () => {
    const { controller, service } = makeController(null);

    await expect(
      controller.sendMessage(makeUser(), 'missing-session', { message: 'hello' }),
    ).rejects.toThrow(AppError);
    expect(service.submitMessage).not.toHaveBeenCalled();
  });

  it('rejects with NOT_FOUND when the session belongs to another student', async () => {
    const { controller, service } = makeController(makeSessionRow({ student_id: 'other-student' }));

    await expect(
      controller.sendMessage(makeUser({ id: 'student-1' }), 'session-1', { message: 'hello' }),
    ).rejects.toThrow(AppError);
    expect(service.submitMessage).not.toHaveBeenCalled();
  });

  it('rejects before checking the session when message is missing', async () => {
    const { controller, service, repository } = makeController();

    await expect(controller.sendMessage(makeUser(), 'session-1', {})).rejects.toThrow(AppError);
    expect(repository.findById).not.toHaveBeenCalled();
    expect(service.submitMessage).not.toHaveBeenCalled();
  });
});
