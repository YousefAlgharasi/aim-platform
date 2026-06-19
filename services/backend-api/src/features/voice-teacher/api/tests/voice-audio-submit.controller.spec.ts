import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { VoiceAudioSubmitController } from '../voice-audio-submit.controller';
import { VoiceOrchestratorService } from '../../orchestrator/voice-orchestrator.service';
import { SupabaseJwtAuthGuard } from '../../../../auth/guards/supabase-jwt-auth.guard';

describe('VoiceAudioSubmitController', () => {
  let controller: VoiceAudioSubmitController;
  const mockOrchestrator = {
    processAudio: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceAudioSubmitController],
      providers: [
        { provide: VoiceOrchestratorService, useValue: mockOrchestrator },
      ],
    })
      .overrideGuard(SupabaseJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(VoiceAudioSubmitController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should process valid audio file', async () => {
    const mockFile = {
      buffer: Buffer.from('audio-data'),
      mimetype: 'audio/webm',
      size: 1024,
      originalname: 'recording.webm',
    } as Express.Multer.File;

    const response = {
      messageId: 'msg-1',
      transcript: 'Hello',
      aiResponseText: 'Hi there',
      audioRef: 'ref-abc',
    };
    mockOrchestrator.processAudio.mockResolvedValue(response);

    const result = await controller.submitAudio(
      'session-1',
      { id: 'student-1' } as any,
      mockFile,
    );

    expect(mockOrchestrator.processAudio).toHaveBeenCalledWith(
      'session-1',
      'student-1',
      mockFile,
    );
    expect(result).toEqual(response);
  });

  it('should reject when no file is provided', async () => {
    await expect(
      controller.submitAudio('session-1', { id: 'student-1' } as any, undefined as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject unsupported MIME type', async () => {
    const mockFile = {
      buffer: Buffer.from('data'),
      mimetype: 'text/plain',
      size: 100,
      originalname: 'file.txt',
    } as Express.Multer.File;

    await expect(
      controller.submitAudio('session-1', { id: 'student-1' } as any, mockFile),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject file exceeding size limit', async () => {
    const mockFile = {
      buffer: Buffer.alloc(11 * 1024 * 1024),
      mimetype: 'audio/webm',
      size: 11 * 1024 * 1024,
      originalname: 'large.webm',
    } as Express.Multer.File;

    await expect(
      controller.submitAudio('session-1', { id: 'student-1' } as any, mockFile),
    ).rejects.toThrow(BadRequestException);
  });
});
