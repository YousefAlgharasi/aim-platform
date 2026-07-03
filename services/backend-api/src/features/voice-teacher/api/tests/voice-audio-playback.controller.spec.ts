import { VoiceAudioPlaybackController } from '../voice-audio-playback.controller';
import { TtsAudioStorageService } from '../../tts-gateway/tts-audio-storage.service';

describe('VoiceAudioPlaybackController', () => {
  let controller: VoiceAudioPlaybackController;
  let audioStorage: jest.Mocked<TtsAudioStorageService>;
  const mockUser = { id: 'student-1', email: 'test@test.com' } as any;

  beforeEach(() => {
    audioStorage = {
      retrieveAudio: jest.fn().mockResolvedValue(null),
    } as any;
    controller = new VoiceAudioPlaybackController(audioStorage);
  });

  it('should return 404 when audio not found', async () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await controller.getAudio('nonexistent-ref', mockUser, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it('should return 404 for empty audioRef', async () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await controller.getAudio('', mockUser, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it('should stream the stored audio bytes with the stored content type', async () => {
    audioStorage.retrieveAudio.mockResolvedValue({
      data: Buffer.from('audio-bytes'),
      contentType: 'audio/mpeg',
    });
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    } as any;

    await controller.getAudio('tts_ref_123', mockUser, mockRes);

    expect(audioStorage.retrieveAudio).toHaveBeenCalledWith('tts_ref_123', 'student-1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'audio/mpeg');
    expect(mockRes.send).toHaveBeenCalledWith(Buffer.from('audio-bytes'));
  });
});
