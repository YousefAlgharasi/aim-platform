import { Test, TestingModule } from '@nestjs/testing';
import { VoiceSessionHistoryController } from '../voice-session-history.controller';
import { VoiceOrchestratorService } from '../../orchestrator/voice-orchestrator.service';
import { SupabaseJwtAuthGuard } from '../../../../auth/guards/supabase-jwt-auth.guard';

describe('VoiceSessionHistoryController', () => {
  let controller: VoiceSessionHistoryController;
  const mockOrchestrator = {
    getSessionHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceSessionHistoryController],
      providers: [
        { provide: VoiceOrchestratorService, useValue: mockOrchestrator },
      ],
    })
      .overrideGuard(SupabaseJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(VoiceSessionHistoryController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return session messages', async () => {
    const messages = [
      { id: 'msg-1', role: 'student', text: 'Hello', timestamp: '2026-01-01T00:00:00Z' },
      { id: 'msg-2', role: 'teacher', text: 'Hi', audioRef: 'ref-1', timestamp: '2026-01-01T00:00:01Z' },
    ];
    mockOrchestrator.getSessionHistory.mockResolvedValue({ messages });

    const result = await controller.getHistory(
      'session-1',
      { id: 'student-1' } as any,
    );

    expect(mockOrchestrator.getSessionHistory).toHaveBeenCalledWith(
      'session-1',
      'student-1',
    );
    expect(result).toEqual({ messages });
  });

  it('should return empty array for new session', async () => {
    mockOrchestrator.getSessionHistory.mockResolvedValue({ messages: [] });

    const result = await controller.getHistory(
      'session-new',
      { id: 'student-1' } as any,
    );

    expect(result.messages).toHaveLength(0);
  });
});
