import { VoiceSessionHistoryController } from '../voice-session-history.controller';
import { ChatHistoryReadService } from '../../../ai-teacher/chat-history/chat-history-read.service';
import { AppError } from '../../../../common/errors/app-error';

describe('VoiceSessionHistoryController', () => {
  let controller: VoiceSessionHistoryController;
  let chatHistoryReadService: jest.Mocked<ChatHistoryReadService>;

  beforeEach(() => {
    chatHistoryReadService = {
      getHistory: jest.fn(),
    } as any;

    controller = new VoiceSessionHistoryController(chatHistoryReadService);
  });

  it('delegates to ChatHistoryReadService with the resolved internal studentId', async () => {
    chatHistoryReadService.getHistory.mockResolvedValue({
      sessionId: 'session-1',
      messages: [],
      focusRecap: null,
    });

    await controller.getSessionHistory('session-1', 'internal-user-1');

    expect(chatHistoryReadService.getHistory).toHaveBeenCalledWith({
      studentId: 'internal-user-1',
      sessionId: 'session-1',
    });
  });

  it('maps ai_teacher role to teacher and student role to student', async () => {
    chatHistoryReadService.getHistory.mockResolvedValue({
      sessionId: 'session-1',
      messages: [
        {
          id: 'm1',
          role: 'ai_teacher',
          text: 'Hello!',
          createdAt: '2026-01-01T00:00:00Z',
          channel: 'text',
          audioRef: 'audio-ref-1',
          audioDurationMs: 1200,
          isGreeting: true,
        },
        {
          id: 'm2',
          role: 'student',
          text: 'Hi',
          createdAt: '2026-01-01T00:01:00Z',
          channel: 'voice',
          audioRef: null,
          audioDurationMs: null,
          isGreeting: false,
        },
      ],
      focusRecap: 'Today we\'re focusing on: past tense',
    });

    const result = await controller.getSessionHistory('session-1', 'internal-user-1');

    expect(result.messages[0]).toMatchObject({ role: 'teacher', isGreeting: true, audioRef: 'audio-ref-1' });
    expect(result.messages[1]).toMatchObject({ role: 'student', channel: 'voice' });
  });

  it('throws a NOT_FOUND AppError when the service returns null (missing/not-owned session)', async () => {
    chatHistoryReadService.getHistory.mockResolvedValue(null);

    await expect(
      controller.getSessionHistory('session-1', 'internal-user-1'),
    ).rejects.toThrow(AppError);
  });

  it('should never include mastery or AIM fields in response', async () => {
    chatHistoryReadService.getHistory.mockResolvedValue({
      sessionId: 'session-1',
      messages: [],
      focusRecap: null,
    });

    const result = await controller.getSessionHistory('session-1', 'internal-user-1');
    const json = JSON.stringify(result);
    expect(json).not.toContain('mastery');
    expect(json).not.toContain('weakness');
    expect(json).not.toContain('difficulty');
  });
});
