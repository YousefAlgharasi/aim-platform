// P18-047: Create AI Safety Status API
// AiTeacherSafetyStatusController tests.

import { AiTeacherSafetyStatusController } from '../ai-teacher-safety-status.controller';
import { AiTeacherSafetyStatusService } from '../ai-teacher-safety-status.service';
import { AiChatSessionRepository } from '../../repositories/ai-chat-session.repository';
import { AiChatSessionRow } from '../../repositories/ai-chat-repository.types';
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
    lesson_teaching_stage: 'greeting',
    resolved_lesson_id: null,
    created_at: '2026-06-19T00:00:00.000Z',
    updated_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

describe('AiTeacherSafetyStatusController', () => {
  function makeController(sessionRow: AiChatSessionRow | null = makeSessionRow()) {
    const service = {
      getStatus: jest.fn().mockResolvedValue({
        sessionId: 'session-1',
        status: 'ok',
        lastCheckedAt: null,
      }),
    } as unknown as AiTeacherSafetyStatusService;
    const repository = {
      findById: jest.fn().mockResolvedValue(sessionRow),
    } as unknown as AiChatSessionRepository;
    const controller = new AiTeacherSafetyStatusController(service, repository);
    return { controller, service, repository };
  }

  it('resolves the session via the route param and checks ownership against the JWT user', async () => {
    const { controller, service, repository } = makeController();

    await controller.getSafetyStatus(makeUser({ id: 'student-1' }).id, 'session-1');

    expect(repository.findById).toHaveBeenCalledWith('session-1');
    expect(service.getStatus).toHaveBeenCalledWith('session-1');
  });

  it('rejects with NOT_FOUND when the session does not exist', async () => {
    const { controller, service } = makeController(null);

    await expect(
      controller.getSafetyStatus(makeUser().id, 'missing-session'),
    ).rejects.toThrow(AppError);
    expect(service.getStatus).not.toHaveBeenCalled();
  });

  it('rejects with NOT_FOUND when the session belongs to another student', async () => {
    const { controller, service } = makeController(makeSessionRow({ student_id: 'other-student' }));

    await expect(
      controller.getSafetyStatus(makeUser({ id: 'student-1' }).id, 'session-1'),
    ).rejects.toThrow(AppError);
    expect(service.getStatus).not.toHaveBeenCalled();
  });
});
