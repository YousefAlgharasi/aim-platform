import { Test, TestingModule } from '@nestjs/testing';
import { VoiceSessionStartController } from '../voice-session-start.controller';
import { VoiceOrchestratorService } from '../../orchestrator/voice-orchestrator.service';
import { SupabaseJwtAuthGuard } from '../../../../auth/guards/supabase-jwt-auth.guard';

describe('VoiceSessionStartController', () => {
  let controller: VoiceSessionStartController;
  const mockOrchestrator = {
    startSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceSessionStartController],
      providers: [
        { provide: VoiceOrchestratorService, useValue: mockOrchestrator },
      ],
    })
      .overrideGuard(SupabaseJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(VoiceSessionStartController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should start a session with contextRef', async () => {
    const sessionId = 'session-uuid-123';
    mockOrchestrator.startSession.mockResolvedValue({ sessionId });

    const result = await controller.startSession(
      { id: 'student-1' } as any,
      { contextRef: 'lesson-1' },
    );

    expect(mockOrchestrator.startSession).toHaveBeenCalledWith(
      'student-1',
      'lesson-1',
    );
    expect(result).toEqual({ sessionId });
  });

  it('should start a session without contextRef', async () => {
    const sessionId = 'session-uuid-456';
    mockOrchestrator.startSession.mockResolvedValue({ sessionId });

    const result = await controller.startSession(
      { id: 'student-1' } as any,
      {},
    );

    expect(mockOrchestrator.startSession).toHaveBeenCalledWith(
      'student-1',
      undefined,
    );
    expect(result).toEqual({ sessionId });
  });

  it('should propagate orchestrator errors', async () => {
    mockOrchestrator.startSession.mockRejectedValue(
      new Error('Service unavailable'),
    );

    await expect(
      controller.startSession({ id: 'student-1' } as any, {}),
    ).rejects.toThrow('Service unavailable');
  });
});
