import { Test, TestingModule } from '@nestjs/testing';
import { VoiceFeedbackController } from '../voice-feedback.controller';
import { VoiceOrchestratorService } from '../../orchestrator/voice-orchestrator.service';
import { SupabaseJwtAuthGuard } from '../../../../auth/guards/supabase-jwt-auth.guard';

describe('VoiceFeedbackController', () => {
  let controller: VoiceFeedbackController;
  const mockOrchestrator = {
    submitFeedback: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceFeedbackController],
      providers: [
        { provide: VoiceOrchestratorService, useValue: mockOrchestrator },
      ],
    })
      .overrideGuard(SupabaseJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(VoiceFeedbackController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should submit helpful feedback', async () => {
    mockOrchestrator.submitFeedback.mockResolvedValue({ success: true });

    const result = await controller.submitFeedback(
      'session-1',
      { id: 'student-1' } as any,
      {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 'helpful' as any,
      },
    );

    expect(mockOrchestrator.submitFeedback).toHaveBeenCalledWith(
      'session-1',
      'student-1',
      {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 'helpful',
      },
    );
    expect(result).toEqual({ success: true });
  });

  it('should submit feedback with optional comment', async () => {
    mockOrchestrator.submitFeedback.mockResolvedValue({ success: true });

    const result = await controller.submitFeedback(
      'session-1',
      { id: 'student-1' } as any,
      {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 'not_helpful' as any,
        comment: 'Too fast',
      },
    );

    expect(mockOrchestrator.submitFeedback).toHaveBeenCalledWith(
      'session-1',
      'student-1',
      {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 'not_helpful',
        comment: 'Too fast',
      },
    );
    expect(result).toEqual({ success: true });
  });

  it('should propagate errors from orchestrator', async () => {
    mockOrchestrator.submitFeedback.mockRejectedValue(
      new Error('Session not found'),
    );

    await expect(
      controller.submitFeedback('session-bad', { id: 'student-1' } as any, {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 'helpful' as any,
      }),
    ).rejects.toThrow('Session not found');
  });
});
