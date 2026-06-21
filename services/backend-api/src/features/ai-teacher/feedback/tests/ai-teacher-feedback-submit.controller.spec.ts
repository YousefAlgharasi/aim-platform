// P8-075: Create AI Teacher Feedback API
// AiTeacherFeedbackSubmitController + SubmitFeedbackRequestDto tests.

import { AiTeacherFeedbackSubmitController } from '../ai-teacher-feedback-submit.controller';
import { AiTeacherFeedbackSubmitService } from '../ai-teacher-feedback-submit.service';
import { SubmitFeedbackRequestDto } from '../ai-teacher-feedback-submit.dto';
import { SubmitTeacherFeedbackResult } from '../ai-teacher-feedback-submit.types';
import { AppError } from '../../../../common/errors/app-error';
import { ApiErrorCode } from '../../../../common/errors/api-error-code';
import { AuthenticatedUser } from '../../../../auth/authenticated-user';

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return { id: 'student-1', email: 'student@example.com', ...overrides } as AuthenticatedUser;
}

function makeResult(
  overrides: Partial<SubmitTeacherFeedbackResult> = {},
): SubmitTeacherFeedbackResult {
  return {
    feedbackId: 'feedback-1',
    messageId: 'message-1',
    rating: 'helpful',
    createdAt: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

describe('SubmitFeedbackRequestDto.fromBody', () => {
  it('returns the rating when valid', () => {
    expect(SubmitFeedbackRequestDto.fromBody({ rating: 'helpful' })).toEqual({
      rating: 'helpful',
    });
    expect(SubmitFeedbackRequestDto.fromBody({ rating: 'not_helpful' })).toEqual({
      rating: 'not_helpful',
    });
  });

  it.each([{ rating: '' }, { rating: 'love_it' }, {}, null, undefined, 'string-body', 42])(
    'throws an AppError VALIDATION_ERROR for invalid body %p',
    (body) => {
      expect(() => SubmitFeedbackRequestDto.fromBody(body)).toThrow(AppError);
    },
  );
});

describe('AiTeacherFeedbackSubmitController', () => {
  function makeController(
    behavior: { result?: SubmitTeacherFeedbackResult; error?: Error } = { result: makeResult() },
  ) {
    const service = {
      submitFeedback: behavior.error
        ? jest.fn().mockRejectedValue(behavior.error)
        : jest.fn().mockResolvedValue(behavior.result),
    } as unknown as AiTeacherFeedbackSubmitService;
    const controller = new AiTeacherFeedbackSubmitController(service);
    return { controller, service };
  }

  it('resolves studentId from the authenticated user and messageId from the route', async () => {
    const { controller, service } = makeController();

    await controller.submitFeedback(makeUser({ id: 'student-1' }), 'message-1', {
      rating: 'helpful',
    });

    expect(service.submitFeedback).toHaveBeenCalledWith({
      studentId: 'student-1',
      messageId: 'message-1',
      rating: 'helpful',
    });
  });

  it('returns the service result unchanged', async () => {
    const result = makeResult({ feedbackId: 'feedback-42' });
    const { controller } = makeController({ result });

    await expect(
      controller.submitFeedback(makeUser(), 'message-1', { rating: 'helpful' }),
    ).resolves.toEqual(result);
  });

  it('rejects before calling the service when rating is missing', async () => {
    const { controller, service } = makeController();

    await expect(controller.submitFeedback(makeUser(), 'message-1', {})).rejects.toThrow(
      AppError,
    );
    expect(service.submitFeedback).not.toHaveBeenCalled();
  });

  it('maps a "message not found" service error to NOT_FOUND', async () => {
    const { controller } = makeController({
      error: new Error('Cannot submit AI Teacher feedback: message not found.'),
    });

    await expect(
      controller.submitFeedback(makeUser(), 'message-1', { rating: 'helpful' }),
    ).rejects.toMatchObject({ code: ApiErrorCode.NOT_FOUND });
  });

  it('maps a "not an AI Teacher reply" service error to FORBIDDEN', async () => {
    const { controller } = makeController({
      error: new Error('Cannot submit AI Teacher feedback: message is not an AI Teacher reply.'),
    });

    await expect(
      controller.submitFeedback(makeUser(), 'message-1', { rating: 'helpful' }),
    ).rejects.toMatchObject({ code: ApiErrorCode.VALIDATION_ERROR });
  });

  it('maps an "already recorded" service error to CONFLICT', async () => {
    const { controller } = makeController({
      error: new Error('Cannot submit AI Teacher feedback: feedback already recorded for this message.'),
    });

    await expect(
      controller.submitFeedback(makeUser(), 'message-1', { rating: 'helpful' }),
    ).rejects.toMatchObject({ code: ApiErrorCode.CONFLICT });
  });

  it('maps an unrecognized service error to a generic INTERNAL_SERVER_ERROR without leaking details', async () => {
    const { controller } = makeController({ error: new Error('unexpected db failure: secret') });

    const rejection = controller.submitFeedback(makeUser(), 'message-1', { rating: 'helpful' });
    await expect(rejection).rejects.toMatchObject({ code: ApiErrorCode.INTERNAL_SERVER_ERROR });
    await expect(rejection).rejects.not.toMatchObject({ message: expect.stringContaining('secret') });
  });
});
