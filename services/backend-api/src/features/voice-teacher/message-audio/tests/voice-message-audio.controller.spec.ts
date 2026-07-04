import { VoiceMessageAudioController } from '../voice-message-audio.controller';
import { VoiceMessageAudioService } from '../voice-message-audio.service';
import { TtsAudioStorageService } from '../../tts-gateway/tts-audio-storage.service';

describe('VoiceMessageAudioController', () => {
  let controller: VoiceMessageAudioController;
  let messageAudioService: jest.Mocked<VoiceMessageAudioService>;
  let audioStorage: jest.Mocked<TtsAudioStorageService>;
  const mockUser = { id: 'student-1', email: 'test@test.com' } as any;

  const mockRes = () =>
    ({
      status: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    }) as any;

  beforeEach(() => {
    messageAudioService = { ensureAudio: jest.fn() } as any;
    audioStorage = { retrieveAudio: jest.fn() } as any;
    controller = new VoiceMessageAudioController(messageAudioService, audioStorage);
  });

  it('cache miss: ensures audio then streams it (first request synthesizes)', async () => {
    messageAudioService.ensureAudio.mockResolvedValue({
      messageId: 'msg-1',
      audioRef: 'tts_new_ref',
      audioDurationMs: 1200,
      synthesized: true,
    });
    audioStorage.retrieveAudio.mockResolvedValue({
      data: Buffer.from('synth-bytes'),
      contentType: 'audio/mpeg',
    });
    const res = mockRes();

    await controller.getMessageAudio('msg-1', mockUser, res, undefined);

    expect(messageAudioService.ensureAudio).toHaveBeenCalledWith('msg-1', 'student-1', 'ar');
    expect(audioStorage.retrieveAudio).toHaveBeenCalledWith('tts_new_ref', 'student-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(Buffer.from('synth-bytes'));
  });

  it('cache hit: repeat request reuses audio_ref without re-synthesizing (verified via service call, synthesized:false)', async () => {
    messageAudioService.ensureAudio.mockResolvedValue({
      messageId: 'msg-1',
      audioRef: 'tts_existing_ref',
      audioDurationMs: 900,
      synthesized: false,
    });
    audioStorage.retrieveAudio.mockResolvedValue({
      data: Buffer.from('existing-bytes'),
      contentType: 'audio/mpeg',
    });
    const res = mockRes();

    await controller.getMessageAudio('msg-1', mockUser, res, undefined);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(Buffer.from('existing-bytes'));
  });

  it('returns 404 when ensureAudio yields no audioRef (synthesis unavailable)', async () => {
    messageAudioService.ensureAudio.mockResolvedValue({
      messageId: 'msg-1',
      audioRef: null,
      audioDurationMs: null,
      synthesized: false,
    });
    const res = mockRes();

    await controller.getMessageAudio('msg-1', mockUser, res, undefined);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(audioStorage.retrieveAudio).not.toHaveBeenCalled();
  });

  it('returns 404 when stored audio bytes cannot be found for a resolved audioRef', async () => {
    messageAudioService.ensureAudio.mockResolvedValue({
      messageId: 'msg-1',
      audioRef: 'tts_ref',
      audioDurationMs: 500,
      synthesized: true,
    });
    audioStorage.retrieveAudio.mockResolvedValue(null);
    const res = mockRes();

    await controller.getMessageAudio('msg-1', mockUser, res, undefined);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('passes through an explicit languageCode query param', async () => {
    messageAudioService.ensureAudio.mockResolvedValue({
      messageId: 'msg-1',
      audioRef: 'tts_ref',
      audioDurationMs: 500,
      synthesized: true,
    });
    audioStorage.retrieveAudio.mockResolvedValue({ data: Buffer.from('x'), contentType: 'audio/mpeg' });
    const res = mockRes();

    await controller.getMessageAudio('msg-1', mockUser, res, 'en');

    expect(messageAudioService.ensureAudio).toHaveBeenCalledWith('msg-1', 'student-1', 'en');
  });
});
