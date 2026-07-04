import { VoiceAudioPlaybackController } from '../voice-audio-playback.controller';
import { TtsAudioStorageService } from '../../tts-gateway/tts-audio-storage.service';
import { TtsAudioGenerationService } from '../../tts-gateway/tts-audio-generation.service';
import { AiChatMessageRepository } from '../../../ai-teacher/repositories/ai-chat-message.repository';

describe('VoiceAudioPlaybackController', () => {
  let controller: VoiceAudioPlaybackController;
  let audioStorage: jest.Mocked<TtsAudioStorageService>;
  let ttsAudioGeneration: jest.Mocked<TtsAudioGenerationService>;
  let chatMessageRepository: jest.Mocked<AiChatMessageRepository>;
  const mockUser = { id: 'student-1', email: 'test@test.com' } as any;

  beforeEach(() => {
    audioStorage = {
      retrieveAudio: jest.fn().mockResolvedValue(null),
    } as any;
    ttsAudioGeneration = {
      synthesize: jest.fn(),
    } as any;
    chatMessageRepository = {
      findById: jest.fn(),
      updateAudio: jest.fn(),
    } as any;
    controller = new VoiceAudioPlaybackController(
      audioStorage,
      ttsAudioGeneration,
      chatMessageRepository,
    );
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

  describe('getAudioForMessage (P21-011 lazy on-demand TTS)', () => {
    const mockRes = () =>
      ({
        status: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn(),
      }) as any;

    it('returns 404 when the message does not exist', async () => {
      chatMessageRepository.findById.mockResolvedValue(null);
      const res = mockRes();

      await controller.getAudioForMessage('msg-1', mockUser, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 404 when the message belongs to a different student', async () => {
      chatMessageRepository.findById.mockResolvedValue({
        id: 'msg-1',
        session_id: 'sess-1',
        student_id: 'someone-else',
        role: 'ai_teacher',
        text: 'hello',
        created_at: new Date().toISOString(),
        channel: 'text',
        audio_ref: null,
        audio_duration_ms: null,
        is_greeting: false,
      } as any);
      const res = mockRes();

      await controller.getAudioForMessage('msg-1', mockUser, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cache miss: synthesizes, persists audio_ref, and returns the audio', async () => {
      chatMessageRepository.findById.mockResolvedValue({
        id: 'msg-1',
        session_id: 'sess-1',
        student_id: 'student-1',
        role: 'ai_teacher',
        text: 'Great job on that answer!',
        created_at: new Date().toISOString(),
        channel: 'text',
        audio_ref: null,
        audio_duration_ms: null,
        is_greeting: false,
      } as any);
      ttsAudioGeneration.synthesize.mockResolvedValue({
        status: 'success',
        audioRef: 'tts_new_ref',
        durationMs: 1200,
        contentType: 'audio/mpeg',
      });
      audioStorage.retrieveAudio.mockResolvedValue({
        data: Buffer.from('synth-bytes'),
        contentType: 'audio/mpeg',
      });
      const res = mockRes();

      await controller.getAudioForMessage('msg-1', mockUser, res);

      expect(ttsAudioGeneration.synthesize).toHaveBeenCalledWith({
        text: 'Great job on that answer!',
        languageCode: 'en',
        sessionId: 'sess-1',
        studentId: 'student-1',
      });
      expect(chatMessageRepository.updateAudio).toHaveBeenCalledWith('msg-1', 'tts_new_ref', 1200);
      expect(audioStorage.retrieveAudio).toHaveBeenCalledWith('tts_new_ref', 'student-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(Buffer.from('synth-bytes'));
    });

    it('cache hit: does not re-synthesize when audio_ref already set', async () => {
      chatMessageRepository.findById.mockResolvedValue({
        id: 'msg-1',
        session_id: 'sess-1',
        student_id: 'student-1',
        role: 'ai_teacher',
        text: 'Already synthesized',
        created_at: new Date().toISOString(),
        channel: 'text',
        audio_ref: 'tts_existing_ref',
        audio_duration_ms: 900,
        is_greeting: false,
      } as any);
      audioStorage.retrieveAudio.mockResolvedValue({
        data: Buffer.from('existing-bytes'),
        contentType: 'audio/mpeg',
      });
      const res = mockRes();

      await controller.getAudioForMessage('msg-1', mockUser, res);

      expect(ttsAudioGeneration.synthesize).not.toHaveBeenCalled();
      expect(chatMessageRepository.updateAudio).not.toHaveBeenCalled();
      expect(audioStorage.retrieveAudio).toHaveBeenCalledWith('tts_existing_ref', 'student-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(Buffer.from('existing-bytes'));
    });

    it('returns 502 when synthesis fails', async () => {
      chatMessageRepository.findById.mockResolvedValue({
        id: 'msg-1',
        session_id: 'sess-1',
        student_id: 'student-1',
        role: 'ai_teacher',
        text: 'oops',
        created_at: new Date().toISOString(),
        channel: 'text',
        audio_ref: null,
        audio_duration_ms: null,
        is_greeting: false,
      } as any);
      ttsAudioGeneration.synthesize.mockResolvedValue({
        status: 'error',
        audioRef: null,
        durationMs: null,
        contentType: null,
        errorCategory: 'TTS_PROVIDER_ERROR',
      });
      const res = mockRes();

      await controller.getAudioForMessage('msg-1', mockUser, res);

      expect(res.status).toHaveBeenCalledWith(502);
      expect(chatMessageRepository.updateAudio).not.toHaveBeenCalled();
    });
  });
});
