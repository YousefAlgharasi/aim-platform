import { VoiceFeedbackController } from '../voice-feedback.controller';

describe('VoiceFeedbackController', () => {
  let controller: VoiceFeedbackController;
  const mockUser = { id: 'student-1', email: 'test@test.com' } as any;

  beforeEach(() => {
    controller = new VoiceFeedbackController();
  });

  it('should record feedback and return feedbackId', async () => {
    const result = await controller.submitFeedback(
      'session-1',
      { messageId: 'msg-1', rating: 'helpful' },
      mockUser,
    );
    expect(result.recorded).toBe(true);
    expect(result.feedbackId).toMatch(/^vf_/);
  });

  it('should accept not_helpful rating', async () => {
    const result = await controller.submitFeedback(
      'session-1',
      { messageId: 'msg-1', rating: 'not_helpful', comment: 'Too fast' },
      mockUser,
    );
    expect(result.recorded).toBe(true);
  });

  it('should never include AIM fields in response', async () => {
    const result = await controller.submitFeedback(
      'session-1',
      { messageId: 'msg-1', rating: 'helpful' },
      mockUser,
    );
    const json = JSON.stringify(result);
    expect(json).not.toContain('mastery');
    expect(json).not.toContain('weakness');
  });

  it('should generate unique feedback IDs', async () => {
    const r1 = await controller.submitFeedback(
      'session-1',
      { messageId: 'msg-1', rating: 'helpful' },
      mockUser,
    );
    const r2 = await controller.submitFeedback(
      'session-1',
      { messageId: 'msg-2', rating: 'not_helpful' },
      mockUser,
    );
    expect(r1.feedbackId).not.toBe(r2.feedbackId);
  });
});
