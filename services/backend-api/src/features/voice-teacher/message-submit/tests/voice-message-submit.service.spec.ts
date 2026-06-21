// P9-050: Build Voice Message Submit Service tests.

import { VoiceMessageSubmitService } from '../voice-message-submit.service';
import { AudioUploadService } from '../../audio-upload/audio-upload.service';
import { VoiceOrchestratorService } from '../../orchestrator/voice-orchestrator.service';
import { VoiceMessageRepository } from '../../repositories/voice-message.repository';
import { VoiceTurnResult } from '../../orchestrator/voice-orchestrator.types';

function makeInput(overrides = {}) {
  return {
    studentId: 'student-1',
    sessionId: 'voice-session-1',
    contextRef: 'lesson:fractions',
    audio: Buffer.from('audio-bytes'),
    mimeType: 'audio/webm',
    durationMs: 1500,
    languageCode: 'en-US',
    ...overrides,
  };
}

function makeTurnResult(overrides: Partial<VoiceTurnResult> = {}): VoiceTurnResult {
  return {
    text: 'Great question!',
    audioRef: null,
    isFallback: false,
    provider: 'fake-provider',
    model: 'fake-model',
    latencyMs: 42,
    ...overrides,
  };
}

function makeServices(turnResult: VoiceTurnResult = makeTurnResult()) {
  const audioUploadService = {
    upload: jest.fn().mockResolvedValue({ messageId: 'voice-message-1', status: 'pending' }),
  } as unknown as AudioUploadService;

  const voiceOrchestrator = {
    handleTurn: jest.fn().mockResolvedValue(turnResult),
  } as unknown as VoiceOrchestratorService;

  const voiceMessageRepository = {
    updateReply: jest.fn().mockResolvedValue(undefined),
    updateAudioRef: jest.fn().mockResolvedValue(undefined),
  } as unknown as VoiceMessageRepository;

  return { audioUploadService, voiceOrchestrator, voiceMessageRepository };
}

describe('VoiceMessageSubmitService', () => {
  it('uploads the audio via AudioUploadService with the given session/student', async () => {
    const { audioUploadService, voiceOrchestrator, voiceMessageRepository } = makeServices();
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator, voiceMessageRepository);

    await service.submitMessage(makeInput());

    expect(audioUploadService.upload).toHaveBeenCalledWith({
      sessionId: 'voice-session-1',
      studentId: 'student-1',
      audio: Buffer.from('audio-bytes'),
      mimeType: 'audio/webm',
      durationMs: 1500,
    });
  });

  it('returns the upload validation error and never calls the orchestrator', async () => {
    const { audioUploadService, voiceOrchestrator, voiceMessageRepository } = makeServices();
    (audioUploadService.upload as jest.Mock).mockResolvedValue({
      statusCode: 400,
      error: 'Bad Request',
    });
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator, voiceMessageRepository);

    const result = await service.submitMessage(makeInput());

    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
    expect(voiceOrchestrator.handleTurn).not.toHaveBeenCalled();
  });

  it('forwards the uploaded message context to the orchestrator', async () => {
    const { audioUploadService, voiceOrchestrator, voiceMessageRepository } = makeServices();
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator, voiceMessageRepository);

    await service.submitMessage(makeInput());

    expect(voiceOrchestrator.handleTurn).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'voice-session-1',
      contextRef: 'lesson:fractions',
      audio: Buffer.from('audio-bytes'),
      contentType: 'audio/webm',
      languageCode: 'en-US',
    });
  });

  it('persists the reply on the voice message when no audioRef is returned', async () => {
    const { audioUploadService, voiceOrchestrator, voiceMessageRepository } = makeServices(
      makeTurnResult({ text: 'Hello there', audioRef: null }),
    );
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator, voiceMessageRepository);

    await service.submitMessage(makeInput());

    expect(voiceMessageRepository.updateReply).toHaveBeenCalledWith('voice-message-1', 'Hello there');
    expect(voiceMessageRepository.updateAudioRef).not.toHaveBeenCalled();
  });

  it('persists the audioRef on the voice message when one is returned', async () => {
    const { audioUploadService, voiceOrchestrator, voiceMessageRepository } = makeServices(
      makeTurnResult({ audioRef: 'storage://voice-replies/1' }),
    );
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator, voiceMessageRepository);

    await service.submitMessage(makeInput());

    expect(voiceMessageRepository.updateAudioRef).toHaveBeenCalledWith(
      'voice-message-1',
      'storage://voice-replies/1',
    );
    expect(voiceMessageRepository.updateReply).not.toHaveBeenCalled();
  });

  it('returns the submit result mapped from the upload and orchestrator outputs', async () => {
    const { audioUploadService, voiceOrchestrator, voiceMessageRepository } = makeServices(
      makeTurnResult({ text: 'Hi!', audioRef: null, isFallback: true }),
    );
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator, voiceMessageRepository);

    const result = await service.submitMessage(makeInput());

    expect(result).toEqual({
      messageId: 'voice-message-1',
      reply: 'Hi!',
      audioRef: null,
      isFallback: true,
    });
  });

  it.each(['studentId', 'sessionId', 'contextRef', 'languageCode'])(
    'throws and never calls audioUploadService when %s is missing',
    async (field) => {
      const { audioUploadService, voiceOrchestrator, voiceMessageRepository } = makeServices();
      const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator, voiceMessageRepository);

      await expect(service.submitMessage(makeInput({ [field]: '   ' }))).rejects.toThrow(/is missing/);
      expect(audioUploadService.upload).not.toHaveBeenCalled();
    },
  );

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const { audioUploadService, voiceOrchestrator, voiceMessageRepository } = makeServices();
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator, voiceMessageRepository);

    const result = await service.submitMessage(makeInput());
    const serialized = JSON.stringify(result);

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/\blevel\b/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });

  it('never hard-codes a provider API key or reads process.env directly', () => {
    const source = require('fs').readFileSync(
      require.resolve('../voice-message-submit.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
