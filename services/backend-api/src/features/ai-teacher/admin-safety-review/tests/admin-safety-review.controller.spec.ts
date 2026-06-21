// P18-051: Create Admin AI Safety Review API
// AdminSafetyReviewController tests.

import { AdminSafetyReviewController } from '../admin-safety-review.controller';
import { AiSafetyEventRepository } from '../../repositories/ai-safety-event.repository';
import { AiTeacherFeedbackRepository } from '../../repositories/ai-teacher-feedback.repository';
import { AiSafetyEventRow, AiTeacherFeedbackRow } from '../../repositories/ai-chat-repository.types';

function makeSafetyEvent(overrides: Partial<AiSafetyEventRow> = {}): AiSafetyEventRow {
  return {
    id: 'event-1',
    session_id: 'session-1',
    direction: 'output',
    decision: 'rejected',
    reason_category: 'unsafe_content',
    created_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

function makeFeedback(overrides: Partial<AiTeacherFeedbackRow> = {}): AiTeacherFeedbackRow {
  return {
    id: 'feedback-1',
    message_id: 'message-1',
    student_id: 'student-1',
    rating: 'not_helpful',
    created_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

describe('AdminSafetyReviewController', () => {
  function makeController() {
    const safetyEventRepository = {
      listRecentRejected: jest.fn().mockResolvedValue([makeSafetyEvent()]),
    } as unknown as AiSafetyEventRepository;
    const feedbackRepository = {
      listRecentNotHelpful: jest.fn().mockResolvedValue([makeFeedback()]),
    } as unknown as AiTeacherFeedbackRepository;
    const controller = new AdminSafetyReviewController(safetyEventRepository, feedbackRepository);
    return { controller, safetyEventRepository, feedbackRepository };
  }

  it('lists recent rejected safety events with a default limit', async () => {
    const { controller, safetyEventRepository } = makeController();
    await controller.listRejectedEvents();
    expect(safetyEventRepository.listRecentRejected).toHaveBeenCalledWith(100);
  });

  it('caps the limit query param at 500', async () => {
    const { controller, safetyEventRepository } = makeController();
    await controller.listRejectedEvents('9999');
    expect(safetyEventRepository.listRecentRejected).toHaveBeenCalledWith(500);
  });

  it('lists recent flagged feedback', async () => {
    const { controller, feedbackRepository } = makeController();
    const result = await controller.listFlaggedFeedback();
    expect(feedbackRepository.listRecentNotHelpful).toHaveBeenCalledWith(100);
    expect(result[0].rating).toBe('not_helpful');
  });

  it('never exposes raw message/response content, only decision and reason_category', async () => {
    const { controller } = makeController();
    const [event] = await controller.listRejectedEvents();
    expect(event).not.toHaveProperty('message');
    expect(event).not.toHaveProperty('response');
    expect(event.decision).toBe('rejected');
  });
});
