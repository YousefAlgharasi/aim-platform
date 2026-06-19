import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VoiceAudioPlaybackController } from '../voice-audio-playback.controller';
import { TtsAudioStorageService } from '../../tts-gateway/tts-audio-storage.service';
import { SupabaseJwtAuthGuard } from '../../../../auth/guards/supabase-jwt-auth.guard';

describe('VoiceAudioPlaybackController', () => {
  let controller: VoiceAudioPlaybackController;
  const mockStorage = {
    retrieveAudio: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceAudioPlaybackController],
      providers: [
        { provide: TtsAudioStorageService, useValue: mockStorage },
      ],
    })
      .overrideGuard(SupabaseJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(VoiceAudioPlaybackController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should stream audio with correct content type', async () => {
    const audioData = Buffer.from('fake-audio');
    mockStorage.retrieveAudio.mockResolvedValue({
      data: audioData,
      contentType: 'audio/mpeg',
    });

    const mockRes = {
      set: jest.fn(),
      send: jest.fn(),
    };

    await controller.playAudio('ref-123', { id: 'student-1' } as any, mockRes as any);

    expect(mockStorage.retrieveAudio).toHaveBeenCalledWith('ref-123', 'student-1');
    expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'audio/mpeg');
    expect(mockRes.send).toHaveBeenCalledWith(audioData);
  });

  it('should throw NotFoundException for unknown audioRef', async () => {
    mockStorage.retrieveAudio.mockRejectedValue(new NotFoundException());

    const mockRes = { set: jest.fn(), send: jest.fn() };

    await expect(
      controller.playAudio('bad-ref', { id: 'student-1' } as any, mockRes as any),
    ).rejects.toThrow(NotFoundException);
  });
});
