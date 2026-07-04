import { NotFoundException } from '@nestjs/common';

import { VoiceMessageAudioService } from '../voice-message-audio.service';
import { AiChatMessageRepository } from '../../../ai-teacher/repositories/ai-chat-message.repository';
import { TtsSafeFailureService } from '../../tts-gateway/tts-safe-failure.service';
import { AiChatMessageRow } from '../../../ai-teacher/repositories/ai-chat-repository.types';

describe('VoiceMessageAudioService', () => {
  const studentId = 'student-1';

  const baseMessage: AiChatMessageRow = {
    id: 'msg-1',
    session_id: 'session-1',
    student_id: studentId,
    role: 'ai_teacher',
    text: 'Hello there',
    created_at: new Date().toISOString(),
    channel: 'text',
    audio_ref: null,
    audio_duration_ms: null,
    is_greeting: false,
  };

  function buildService(overrides: {
    findById?: jest.Mock;
    updateAudio?: jest.Mock;
    ttsGateway?: { synthesize: jest.Mock } | null;
  } = {}) {
    const repository = {
      findById: overrides.findById ?? jest.fn().mockResolvedValue(baseMessage),
      updateAudio:
        overrides.updateAudio ??
        jest.fn().mockResolvedValue({
          ...baseMessage,
          audio_ref: 'tts_abc',
          audio_duration_ms: 1200,
        }),
    } as unknown as AiChatMessageRepository;

    const ttsGateway =
      overrides.ttsGateway === undefined
        ? { synthesize: jest.fn().mockResolvedValue({ status: 'success', audioRef: 'tts_abc', durationMs: 1200, contentType: 'audio/mpeg' }) }
        : overrides.ttsGateway;

    const service = new VoiceMessageAudioService(
      repository,
      ttsGateway as any,
      new TtsSafeFailureService(),
    );

    return { service, repository, ttsGateway };
  }

  it('throws NotFoundException when the message does not exist', async () => {
    const { service } = buildService({ findById: jest.fn().mockResolvedValue(null) });
    await expect(service.ensureAudio('missing', studentId, 'ar')).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when the message belongs to another student', async () => {
    const { service } = buildService({
      findById: jest.fn().mockResolvedValue({ ...baseMessage, student_id: 'someone-else' }),
    });
    await expect(service.ensureAudio('msg-1', studentId, 'ar')).rejects.toThrow(NotFoundException);
  });

  it('cache hit: reuses an existing audio_ref without calling the TTS gateway', async () => {
    const { service, ttsGateway } = buildService({
      findById: jest.fn().mockResolvedValue({ ...baseMessage, audio_ref: 'tts_existing', audio_duration_ms: 900 }),
    });

    const result = await service.ensureAudio('msg-1', studentId, 'ar');

    expect(result).toEqual({
      messageId: 'msg-1',
      audioRef: 'tts_existing',
      audioDurationMs: 900,
      synthesized: false,
    });
    expect((ttsGateway as any).synthesize).not.toHaveBeenCalled();
  });

  it('cache miss: synthesizes and persists audio_ref on first request', async () => {
    const { service, ttsGateway, repository } = buildService();

    const result = await service.ensureAudio('msg-1', studentId, 'ar');

    expect((ttsGateway as any).synthesize).toHaveBeenCalledTimes(1);
    expect(repository.updateAudio).toHaveBeenCalledWith('msg-1', 'tts_abc', 1200);
    expect(result).toEqual({
      messageId: 'msg-1',
      audioRef: 'tts_abc',
      audioDurationMs: 1200,
      synthesized: true,
    });
  });

  it('does not call the TTS gateway a second time once cached (repeat request behaves as cache hit)', async () => {
    const findById = jest
      .fn()
      .mockResolvedValueOnce(baseMessage)
      .mockResolvedValueOnce({ ...baseMessage, audio_ref: 'tts_abc', audio_duration_ms: 1200 });
    const { service, ttsGateway } = buildService({ findById });

    await service.ensureAudio('msg-1', studentId, 'ar');
    await service.ensureAudio('msg-1', studentId, 'ar');

    expect((ttsGateway as any).synthesize).toHaveBeenCalledTimes(1);
  });

  it('returns audioRef null gracefully when the TTS gateway is not bound', async () => {
    const { service } = buildService({ ttsGateway: null });

    const result = await service.ensureAudio('msg-1', studentId, 'ar');

    expect(result).toEqual({
      messageId: 'msg-1',
      audioRef: null,
      audioDurationMs: null,
      synthesized: false,
    });
  });

  it('returns audioRef null gracefully when synthesis fails', async () => {
    const { service } = buildService({
      ttsGateway: { synthesize: jest.fn().mockResolvedValue({ status: 'error', audioRef: null, durationMs: null, contentType: null }) },
    });

    const result = await service.ensureAudio('msg-1', studentId, 'ar');

    expect(result.audioRef).toBeNull();
    expect(result.synthesized).toBe(false);
  });
});
