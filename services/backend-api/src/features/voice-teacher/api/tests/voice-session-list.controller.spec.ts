import { Test, TestingModule } from '@nestjs/testing';
import { VoiceSessionListController } from '../voice-session-list.controller';
import { VoiceOrchestratorService } from '../../orchestrator/voice-orchestrator.service';
import { SupabaseJwtAuthGuard } from '../../../../auth/guards/supabase-jwt-auth.guard';

describe('VoiceSessionListController', () => {
  let controller: VoiceSessionListController;
  const mockOrchestrator = {
    listSessions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceSessionListController],
      providers: [
        { provide: VoiceOrchestratorService, useValue: mockOrchestrator },
      ],
    })
      .overrideGuard(SupabaseJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(VoiceSessionListController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return list of sessions for student', async () => {
    const sessions = [
      { sessionId: 's-1', createdAt: '2026-01-01T00:00:00Z', messageCount: 5 },
      { sessionId: 's-2', createdAt: '2026-01-02T00:00:00Z', messageCount: 3 },
    ];
    mockOrchestrator.listSessions.mockResolvedValue({ sessions });

    const result = await controller.listSessions({ id: 'student-1' } as any);

    expect(mockOrchestrator.listSessions).toHaveBeenCalledWith('student-1');
    expect(result.sessions).toHaveLength(2);
  });

  it('should return empty list when no sessions exist', async () => {
    mockOrchestrator.listSessions.mockResolvedValue({ sessions: [] });

    const result = await controller.listSessions({ id: 'student-1' } as any);

    expect(result.sessions).toHaveLength(0);
  });
});
