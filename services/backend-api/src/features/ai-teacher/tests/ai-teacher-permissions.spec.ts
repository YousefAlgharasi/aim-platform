// P18-053: Add AI Teacher Permission Tests
//
// Verifies, across the whole AI Teacher feature, that:
//   1. Every student-facing controller is restricted to STUDENT and every
//      admin controller is restricted to ADMIN/SUPER_ADMIN via the
//      RequireRoles metadata, and every admin controller runs
//      SupabaseJwtAuthGuard + RoleGuard.
//   2. Student-facing controllers that read a session/message owned by
//      another student reject the request as NOT_FOUND (no existence
//      leak), never serving cross-student conversation/history data.
//
// This does not duplicate the per-controller ownership tests already in
// each feature's own `tests/` directory — it is a single cross-cutting
// suite asserting the access-control invariant holds everywhere.

import 'reflect-metadata';
import { Observable } from 'rxjs';

import { REQUIRED_ROLES_KEY } from '../../../auth/authorization/authorization.constants';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

import { ChatHistoryReadController } from '../chat-history/chat-history-read.controller';
import { ChatMessageSubmitController } from '../chat-message/chat-message-submit.controller';
import { AiTeacherFeedbackSubmitController } from '../feedback/ai-teacher-feedback-submit.controller';
import { AiTeacherStreamMessageController } from '../streaming-api/ai-teacher-stream-message.controller';
import { ChatSessionListReadController } from '../chat-session-list/chat-session-list-read.controller';
import { AiTeacherSafetyStatusController } from '../safety-status/ai-teacher-safety-status.controller';
import { ChatSessionStartController } from '../chat-session/chat-session-start.controller';
import { AdminPromptController } from '../admin-prompts/admin-prompt.controller';
import { AdminModelConfigController } from '../admin-model-configs/admin-model-config.controller';
import { AdminUsageCostController } from '../admin-usage-cost/admin-usage-cost.controller';
import { AdminSafetyReviewController } from '../admin-safety-review/admin-safety-review.controller';

function getClassRoles(target: object): AuthorizedRole[] | undefined {
  return Reflect.getMetadata(REQUIRED_ROLES_KEY, target);
}

function getMethodRoles(target: object, methodName: string): AuthorizedRole[] | undefined {
  const proto = (target as { prototype: Record<string, unknown> }).prototype;
  return Reflect.getMetadata(REQUIRED_ROLES_KEY, proto[methodName] as object);
}

function getClassGuards(target: object): unknown[] | undefined {
  return Reflect.getMetadata('__guards__', target);
}

describe('AI Teacher permission metadata: student-facing controllers require STUDENT', () => {
  const studentControllers: Array<[string, { new (...args: any[]): unknown }, string]> = [
    ['ChatSessionStartController', ChatSessionStartController, 'startSession'],
    ['ChatMessageSubmitController', ChatMessageSubmitController, 'sendMessage'],
    ['ChatHistoryReadController', ChatHistoryReadController, 'getHistory'],
    ['ChatSessionListReadController', ChatSessionListReadController, 'listSessions'],
    ['AiTeacherFeedbackSubmitController', AiTeacherFeedbackSubmitController, 'submitFeedback'],
    ['AiTeacherStreamMessageController', AiTeacherStreamMessageController, 'streamMessage'],
    ['AiTeacherSafetyStatusController', AiTeacherSafetyStatusController, 'getSafetyStatus'],
  ];

  it.each(studentControllers)('%s requires STUDENT role', (_name, Controller, methodName) => {
    const roles = getMethodRoles(Controller, methodName) ?? getClassRoles(Controller);
    expect(roles).toEqual([AuthorizedRole.STUDENT]);
  });
});

describe('AI Teacher permission metadata: admin controllers require ADMIN/SUPER_ADMIN', () => {
  const adminControllers: Array<[string, { new (...args: any[]): unknown }]> = [
    ['AdminPromptController', AdminPromptController],
    ['AdminModelConfigController', AdminModelConfigController],
    ['AdminUsageCostController', AdminUsageCostController],
    ['AdminSafetyReviewController', AdminSafetyReviewController],
  ];

  it.each(adminControllers)('%s requires ADMIN or SUPER_ADMIN role', (_name, Controller) => {
    const roles = getClassRoles(Controller);
    expect(roles).toEqual([AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN]);
  });

  it.each(adminControllers)('%s runs SupabaseJwtAuthGuard and RoleGuard', (_name, Controller) => {
    const guards = getClassGuards(Controller);
    expect(guards).toEqual([SupabaseJwtAuthGuard, RoleGuard]);
  });
});

describe('AI Teacher cross-student ownership rejection', () => {
  it('ChatMessageSubmitController rejects a session owned by another student', async () => {
    const otherStudentSession = { id: 'session-1', student_id: 'student-other', context_ref: 'ctx' };
    const chatSessionRepository = { findById: jest.fn().mockResolvedValue(otherStudentSession) };
    const chatMessageSubmitService = { submitMessage: jest.fn() };
    const controller = new ChatMessageSubmitController(
      chatMessageSubmitService as any,
      chatSessionRepository as any,
    );

    await expect(
      controller.sendMessage({ id: 'student-me' } as any, 'session-1', { message: 'hi' }),
    ).rejects.toThrow(AppError);
    expect(chatMessageSubmitService.submitMessage).not.toHaveBeenCalled();
  });

  it('AiTeacherStreamMessageController rejects a session owned by another student (no chunks emitted)', async () => {
    const otherStudentSession = { id: 'session-1', student_id: 'student-other', context_ref: 'ctx' };
    const chatSessionRepository = { findById: jest.fn().mockResolvedValue(otherStudentSession) };
    const streamMessageService = { streamTurn: jest.fn() };
    const controller = new AiTeacherStreamMessageController(streamMessageService as any, chatSessionRepository as any);

    const observable = controller.streamMessage({ id: 'student-me' } as any, 'session-1', { message: 'hi' });
    expect(observable).toBeInstanceOf(Observable);

    const events: unknown[] = [];
    const error = await new Promise((resolve) => {
      observable.subscribe({
        next: (event) => events.push(event),
        error: (err) => resolve(err),
        complete: () => resolve(undefined),
      });
    });

    expect(events).toEqual([]);
    expect(error).toBeInstanceOf(AppError);
    expect(streamMessageService.streamTurn).not.toHaveBeenCalled();
  });

  it('AiTeacherSafetyStatusController rejects a session owned by another student', async () => {
    const otherStudentSession = { id: 'session-1', student_id: 'student-other' };
    const chatSessionRepository = { findById: jest.fn().mockResolvedValue(otherStudentSession) };
    const safetyStatusService = { getStatus: jest.fn() };
    const controller = new AiTeacherSafetyStatusController(safetyStatusService as any, chatSessionRepository as any);

    await expect(controller.getSafetyStatus({ id: 'student-me' } as any, 'session-1')).rejects.toThrow(AppError);
    expect(safetyStatusService.getStatus).not.toHaveBeenCalled();
  });

  it('ChatHistoryReadController rejects history for a session not owned by the caller (service returns null)', async () => {
    const chatHistoryReadService = { getHistory: jest.fn().mockResolvedValue(null) };
    const controller = new ChatHistoryReadController(chatHistoryReadService as any);

    await expect(controller.getHistory({ id: 'student-me' } as any, 'session-1')).rejects.toThrow(AppError);
    expect(chatHistoryReadService.getHistory).toHaveBeenCalledWith({
      studentId: 'student-me',
      sessionId: 'session-1',
    });
  });

  it("AiTeacherFeedbackSubmitController rejects feedback for a message in another student's session", async () => {
    const feedbackSubmitService = {
      submitFeedback: jest.fn().mockRejectedValue(new Error('message not found')),
    };
    const controller = new AiTeacherFeedbackSubmitController(feedbackSubmitService as any);

    await expect(
      controller.submitFeedback({ id: 'student-me' } as any, 'message-1', { rating: 'helpful' }),
    ).rejects.toMatchObject({ code: ApiErrorCode.NOT_FOUND });
  });
});
