import { VoiceAudioPlaybackController } from '../voice-audio-playback.controller';

describe('VoiceAudioPlaybackController', () => {
  let controller: VoiceAudioPlaybackController;
  const mockUser = { id: 'student-1', email: 'test@test.com' } as any;

  beforeEach(() => {
    controller = new VoiceAudioPlaybackController();
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
});
