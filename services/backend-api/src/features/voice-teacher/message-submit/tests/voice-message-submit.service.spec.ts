// P9-050: Build Voice Message Submit Service tests.
// P21-010: persistence of the transcript/reply moved into ai_chat_messages,
// driven inside VoiceOrchestratorService/AiTeacherOrchestratorService — this
// service no longer writes to voice_messages itself.

import { VoiceMessageSubmitService } from '../voice-message-submit.service';
import { AudioUploadService } from '../../audio-upload/audio-upload.service';
import { VoiceOrchestratorService } from '../../orchestrator/voice-orchestrator.service';
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

  return { audioUploadService, voiceOrchestrator };
}

describe('VoiceMessageSubmitService', () => {
  it('uploads the audio via AudioUploadService with the given session/student', async () => {
    const { audioUploadService, voiceOrchestrator } = makeServices();
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator);

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
    const { audioUploadService, voiceOrchestrator } = makeServices();
    (audioUploadService.upload as jest.Mock).mockResolvedValue({
      statusCode: 400,
      error: 'Bad Request',
    });
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator);

    const result = await service.submitMessage(makeInput());

    expect(result).toEqual({ statusCode: 400, error: 'Bad Request' });
    expect(voiceOrchestrator.handleTurn).not.toHaveBeenCalled();
  });

  it('forwards the uploaded message context to the orchestrator', async () => {
    const { audioUploadService, voiceOrchestrator } = makeServices();
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator);

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

  it('returns the submit result mapped from the upload and orchestrator outputs, without writing to voice_messages', async () => {
    const { audioUploadService, voiceOrchestrator } = makeServices(
      makeTurnResult({ text: 'Hi!', audioRef: null, isFallback: true }),
    );
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator);

    const result = await service.submitMessage(makeInput());

    expect(result).toEqual({
      messageId: 'voice-message-1',
      reply: 'Hi!',
      audioRef: null,
      isFallback: true,
    });
  });

  it('returns the audioRef from the orchestrator result unchanged when TTS succeeded', async () => {
    const { audioUploadService, voiceOrchestrator } = makeServices(
      makeTurnResult({ audioRef: 'storage://voice-replies/1' }),
    );
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator);

    const result = await service.submitMessage(makeInput());

    expect(result).toEqual(
      expect.objectContaining({ audioRef: 'storage://voice-replies/1' }),
    );
  });

  it.each(['studentId', 'sessionId', 'contextRef', 'languageCode'])(
    'throws and never calls audioUploadService when %s is missing',
    async (field) => {
      const { audioUploadService, voiceOrchestrator } = makeServices();
      const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator);

      await expect(service.submitMessage(makeInput({ [field]: '   ' }))).rejects.toThrow(/is missing/);
      expect(audioUploadService.upload).not.toHaveBeenCalled();
    },
  );

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const { audioUploadService, voiceOrchestrator } = makeServices();
    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator);

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

  // P21-014: barge-in requires the backend to accept a new voice submission
  // for a session without waiting for the previous turn to be marked
  // "played"/"done" client-side first. Grepping this service (and
  // VoiceOrchestratorService) turned up no in-flight lock, no
  // "previous message must be completed" status check, and no per-session
  // mutex — AudioUploadService.upload() always creates a fresh
  // voice_messages placeholder row and VoiceOrchestratorService always runs
  // a fresh STT->AI Teacher->TTS pipeline, regardless of any other
  // submission's state. This test is therefore verification-only, proving
  // two rapid, overlapping submissions for the same session both succeed
  // and persist in the order their upload step completes.
  it('accepts two rapid submissions for the same session and persists them in order (barge-in safe)', async () => {
    const audioUploadService = {
      upload: jest
        .fn()
        .mockResolvedValueOnce({ messageId: 'voice-message-1', status: 'pending' })
        .mockResolvedValueOnce({ messageId: 'voice-message-2', status: 'pending' }),
    } as unknown as AudioUploadService;

    const voiceOrchestrator = {
      handleTurn: jest
        .fn()
        .mockResolvedValueOnce(makeTurnResult({ text: 'First reply' }))
        .mockResolvedValueOnce(makeTurnResult({ text: 'Second reply (barge-in)' })),
    } as unknown as VoiceOrchestratorService;

    const service = new VoiceMessageSubmitService(audioUploadService, voiceOrchestrator);

    const [first, second] = await Promise.all([
      service.submitMessage(makeInput({ sessionId: 'voice-session-1' })),
      service.submitMessage(makeInput({ sessionId: 'voice-session-1' })),
    ]);

    expect(audioUploadService.upload).toHaveBeenCalledTimes(2);
    expect(voiceOrchestrator.handleTurn).toHaveBeenCalledTimes(2);
    expect('reply' in first && first.reply).toBe('First reply');
    expect('reply' in second && second.reply).toBe('Second reply (barge-in)');
    expect('messageId' in first && first.messageId).toBe('voice-message-1');
    expect('messageId' in second && second.messageId).toBe('voice-message-2');
  });
});
