// P8-068: Build AI Teacher Feedback Service
// AiTeacherFeedbackSubmitService tests.

import { AiTeacherFeedbackSubmitService } from '../ai-teacher-feedback-submit.service';
import { AiChatMessageRepository } from '../../repositories/ai-chat-message.repository';
import { AiTeacherFeedbackRepository } from '../../repositories/ai-teacher-feedback.repository';
import { AiChatMessageRow, AiTeacherFeedbackRow } from '../../repositories/ai-chat-repository.types';

function makeMessageRow(overrides: Partial<AiChatMessageRow> = {}): AiChatMessageRow {
  return {
    id: 'message-1',
    session_id: 'session-1',
    student_id: 'student-1',
    role: 'ai_teacher',
    text: "Great question! Let's break it down.",
    created_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

function makeFeedbackRow(overrides: Partial<AiTeacherFeedbackRow> = {}): AiTeacherFeedbackRow {
  return {
    id: 'feedback-1',
    message_id: 'message-1',
    student_id: 'student-1',
    rating: 'helpful',
    created_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

function makeRepositories(
  messageRow: AiChatMessageRow | null = makeMessageRow(),
  existingFeedback: AiTeacherFeedbackRow | null = null,
  createdFeedback: AiTeacherFeedbackRow = makeFeedbackRow(),
) {
  const messageRepository = {
    findById: jest.fn().mockResolvedValue(messageRow),
  } as unknown as AiChatMessageRepository;
  const feedbackRepository = {
    findByMessageId: jest.fn().mockResolvedValue(existingFeedback),
    create: jest.fn().mockResolvedValue(createdFeedback),
  } as unknown as AiTeacherFeedbackRepository;
  return { messageRepository, feedbackRepository };
}

describe('AiTeacherFeedbackSubmitService', () => {
  it('creates feedback for a valid, owned AI Teacher message', async () => {
    const { messageRepository, feedbackRepository } = makeRepositories();
    const service = new AiTeacherFeedbackSubmitService(messageRepository, feedbackRepository);

    const result = await service.submitFeedback({
      studentId: 'student-1',
      messageId: 'message-1',
      rating: 'helpful',
    });

    expect(feedbackRepository.create).toHaveBeenCalledWith('message-1', 'student-1', 'helpful');
    expect(result).toEqual({
      feedbackId: 'feedback-1',
      messageId: 'message-1',
      rating: 'helpful',
      createdAt: '2026-06-19T00:00:00.000Z',
    });
  });

  it('throws when studentId is missing', async () => {
    const { messageRepository, feedbackRepository } = makeRepositories();
    const service = new AiTeacherFeedbackSubmitService(messageRepository, feedbackRepository);

    await expect(
      service.submitFeedback({ studentId: '', messageId: 'message-1', rating: 'helpful' }),
    ).rejects.toThrow('studentId is missing');
  });

  it('throws when messageId is missing', async () => {
    const { messageRepository, feedbackRepository } = makeRepositories();
    const service = new AiTeacherFeedbackSubmitService(messageRepository, feedbackRepository);

    await expect(
      service.submitFeedback({ studentId: 'student-1', messageId: '', rating: 'helpful' }),
    ).rejects.toThrow('messageId is missing');
  });

  it('throws when rating is not in the locked enum', async () => {
    const { messageRepository, feedbackRepository } = makeRepositories();
    const service = new AiTeacherFeedbackSubmitService(messageRepository, feedbackRepository);

    await expect(
      service.submitFeedback({
        studentId: 'student-1',
        messageId: 'message-1',
        rating: 'love_it' as never,
      }),
    ).rejects.toThrow('rating must be helpful or not_helpful');
  });

  it('throws when the message does not exist', async () => {
    const { messageRepository, feedbackRepository } = makeRepositories(null);
    const service = new AiTeacherFeedbackSubmitService(messageRepository, feedbackRepository);

    await expect(
      service.submitFeedback({ studentId: 'student-1', messageId: 'missing', rating: 'helpful' }),
    ).rejects.toThrow('message not found');
  });

  it('throws when the message belongs to another student', async () => {
    const { messageRepository, feedbackRepository } = makeRepositories(
      makeMessageRow({ student_id: 'other-student' }),
    );
    const service = new AiTeacherFeedbackSubmitService(messageRepository, feedbackRepository);

    await expect(
      service.submitFeedback({ studentId: 'student-1', messageId: 'message-1', rating: 'helpful' }),
    ).rejects.toThrow('message not found');
  });

  it('throws when the message is a student message, not an AI Teacher reply', async () => {
    const { messageRepository, feedbackRepository } = makeRepositories(
      makeMessageRow({ role: 'student' }),
    );
    const service = new AiTeacherFeedbackSubmitService(messageRepository, feedbackRepository);

    await expect(
      service.submitFeedback({ studentId: 'student-1', messageId: 'message-1', rating: 'helpful' }),
    ).rejects.toThrow('not an AI Teacher reply');
  });

  it('throws when feedback already exists for the message', async () => {
    const { messageRepository, feedbackRepository } = makeRepositories(
      makeMessageRow(),
      makeFeedbackRow(),
    );
    const service = new AiTeacherFeedbackSubmitService(messageRepository, feedbackRepository);

    await expect(
      service.submitFeedback({ studentId: 'student-1', messageId: 'message-1', rating: 'helpful' }),
    ).rejects.toThrow('already recorded');
    expect(feedbackRepository.create).not.toHaveBeenCalled();
  });
});
