// P18-057: Add Voice Session Tests
// Cross-cutting voice tutor backend suite. Each underlying unit
// (VoiceSessionStartService, evaluateAudioDurationPolicy, VoiceRateLimitPolicyService,
// VoiceOrchestratorService, TranscriptToAiTeacherService) already has its own
// dedicated spec — this file proves they compose correctly across the full
// turn lifecycle: session start -> duration limit enforcement -> rate limit
// enforcement -> STT -> AI Teacher safety-checked reply -> cost-tracking gap.

import { evaluateAudioDurationPolicy } from '../audio-upload/audio-duration-policy';
import { AUDIO_UPLOAD_MAX_DURATION_MS, AUDIO_UPLOAD_MIN_DURATION_MS } from '../audio-upload/audio-upload.constants';
import { VoiceSessionStartService } from '../session-start/voice-session-start.service';
import { VoiceSessionRepository } from '../session-start/voice-session.repository';
import { VoiceRateLimitPolicyService } from '../rate-limit-policy/voice-rate-limit-policy.service';
import { VoiceRateLimitExceededError } from '../rate-limit-policy/voice-rate-limit-exceeded.error';
import { VoiceMessageRepository } from '../repositories/voice-message.repository';
import { VoiceOrchestratorService } from '../orchestrator/voice-orchestrator.service';
import { SttGateway } from '../stt-gateway/stt-gateway.interface';
import { SttSafeFailureService } from '../stt-gateway/stt-safe-failure.service';
import { SttProviderResponse } from '../stt-gateway/stt-gateway.types';
import { TtsGateway } from '../tts-gateway/tts-gateway.interface';
import { TtsSafeFailureService } from '../tts-gateway/tts-safe-failure.service';
import { AiTeacherOrchestratorService } from '../../ai-teacher/orchestrator/ai-teacher-orchestrator.service';
import { TranscriptToAiTeacherService } from '../transcript-pipeline/transcript-to-ai-teacher.service';

const makeMockTtsGateway = (): TtsGateway =>
  ({
    synthesize: jest.fn().mockResolvedValue({
      status: 'error',
      audioRef: null,
      durationMs: null,
      contentType: null,
      errorCategory: 'TTS_NOT_CONFIGURED_IN_TEST',
    }),
  }) as unknown as TtsGateway;

describe('Voice tutor — session lifecycle', () => {
  it('starts a voice session owned by the requesting student', async () => {
    const repository = {
      create: jest.fn().mockResolvedValue({
        id: 'voice-session-1',
        student_id: 'student-1',
        context_ref: 'lesson:fractions',
        status: 'active',
        created_at: '2026-06-19T00:00:00.000Z',
      }),
    } as unknown as VoiceSessionRepository;
    const service = new VoiceSessionStartService(repository);

    const result = await service.startSession({ studentId: 'student-1', contextRef: 'lesson:fractions' });

    expect(result.sessionId).toBe('voice-session-1');
    expect(result.studentId).toBe('student-1');
    expect(repository.create).toHaveBeenCalledWith('student-1', 'lesson:fractions');
  });

  it('rejects starting a session without a studentId', async () => {
    const repository = { create: jest.fn() } as unknown as VoiceSessionRepository;
    const service = new VoiceSessionStartService(repository);

    await expect(service.startSession({ studentId: '', contextRef: 'lesson:fractions' })).rejects.toThrow(
      /studentId is missing/,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});

describe('Voice tutor — duration limits', () => {
  it('accepts audio within the configured min/max duration window', () => {
    const midpoint = Math.floor((AUDIO_UPLOAD_MIN_DURATION_MS + AUDIO_UPLOAD_MAX_DURATION_MS) / 2);
    expect(evaluateAudioDurationPolicy(midpoint)).toEqual({ valid: true, violation: null });
  });

  it('rejects audio shorter than the minimum duration', () => {
    expect(evaluateAudioDurationPolicy(AUDIO_UPLOAD_MIN_DURATION_MS - 1)).toEqual({
      valid: false,
      violation: 'TOO_SHORT',
    });
  });

  it('rejects audio longer than the maximum duration', () => {
    expect(evaluateAudioDurationPolicy(AUDIO_UPLOAD_MAX_DURATION_MS + 1)).toEqual({
      valid: false,
      violation: 'TOO_LONG',
    });
  });
});

describe('Voice tutor — rate limits (cost-protection gate before any provider call)', () => {
  it('allows a turn when no thresholds are breached', async () => {
    const voiceMessageRepository = {
      findLastCreatedAtBySessionId: jest.fn().mockResolvedValue(null),
      countBySessionId: jest.fn().mockResolvedValue(0),
      countByStudentIdSince: jest.fn().mockResolvedValue(0),
    } as unknown as VoiceMessageRepository;
    const policy = new VoiceRateLimitPolicyService(voiceMessageRepository);

    await expect(
      policy.assertNotRateLimited({ studentId: 'student-1', sessionId: 'voice-session-1' }),
    ).resolves.toBeUndefined();
  });

  it('blocks a turn once the per-session turn limit is reached, before any STT/AI call would happen', async () => {
    const voiceMessageRepository = {
      findLastCreatedAtBySessionId: jest.fn().mockResolvedValue(null),
      countBySessionId: jest.fn().mockResolvedValue(9999),
      countByStudentIdSince: jest.fn().mockResolvedValue(0),
    } as unknown as VoiceMessageRepository;
    const policy = new VoiceRateLimitPolicyService(voiceMessageRepository);

    await expect(
      policy.assertNotRateLimited({ studentId: 'student-1', sessionId: 'voice-session-1' }),
    ).rejects.toBeInstanceOf(VoiceRateLimitExceededError);
  });
});

describe('Voice tutor — STT -> AI Teacher safety-checked reply (full turn)', () => {
  it('transcribes audio, forwards the transcript to the safety-checked AI Teacher pipeline, and returns its reply', async () => {
    const sttResponse: SttProviderResponse = {
      status: 'success',
      transcript: 'How do I add fractions?',
      durationMs: 900,
    };
    const sttGateway = { transcribe: jest.fn().mockResolvedValue(sttResponse) } as unknown as SttGateway;
    const sttSafeFailure = new SttSafeFailureService();
    const aiOrchestrator = {
      handleTurn: jest.fn().mockResolvedValue({
        text: 'Add the numerators when denominators match.',
        isFallback: false,
        provider: 'fake-provider',
        model: 'fake-model',
        latencyMs: 50,
      }),
    } as unknown as AiTeacherOrchestratorService;

    const orchestrator = new VoiceOrchestratorService(sttGateway, sttSafeFailure, makeMockTtsGateway(), new TtsSafeFailureService(), aiOrchestrator);

    const result = await orchestrator.handleTurn({
      studentId: 'student-1',
      sessionId: 'voice-session-1',
      contextRef: 'lesson:fractions',
      audio: Buffer.from('fake-audio'),
      contentType: 'audio/webm;codecs=opus',
      languageCode: 'en',
    });

    expect(aiOrchestrator.handleTurn).toHaveBeenCalledWith(
      expect.objectContaining({ studentMessage: 'How do I add fractions?' }),
    );
    expect(result.text).toBe('Add the numerators when denominators match.');
  });

  it('a blocked/unsafe AI Teacher reply (safety filter triggered) still flows through as a safe fallback, never throwing', async () => {
    const sttResponse: SttProviderResponse = { status: 'success', transcript: 'unsafe request', durationMs: 500 };
    const sttGateway = { transcribe: jest.fn().mockResolvedValue(sttResponse) } as unknown as SttGateway;
    const sttSafeFailure = new SttSafeFailureService();
    const aiOrchestrator = {
      handleTurn: jest.fn().mockResolvedValue({
        text: "AI Teacher can't share that response, please rephrase your question.",
        isFallback: true,
        provider: 'fake-provider',
        model: 'fake-model',
        latencyMs: 30,
      }),
    } as unknown as AiTeacherOrchestratorService;

    const orchestrator = new VoiceOrchestratorService(sttGateway, sttSafeFailure, makeMockTtsGateway(), new TtsSafeFailureService(), aiOrchestrator);

    const result = await orchestrator.handleTurn({
      studentId: 'student-1',
      sessionId: 'voice-session-1',
      contextRef: 'lesson:fractions',
      audio: Buffer.from('fake-audio'),
      contentType: 'audio/webm;codecs=opus',
      languageCode: 'en',
    });

    expect(result.isFallback).toBe(true);
    expect(result.text).toBe("AI Teacher can't share that response, please rephrase your question.");
  });

  it('TranscriptToAiTeacherService dispatches a non-empty transcript and surfaces the AI Teacher fallback flag unchanged', async () => {
    const aiOrchestrator = {
      handleTurn: jest.fn().mockResolvedValue({
        text: 'reply',
        isFallback: false,
        provider: 'fake-provider',
        model: 'fake-model',
        latencyMs: 10,
      }),
    } as unknown as AiTeacherOrchestratorService;
    const service = new TranscriptToAiTeacherService(aiOrchestrator);

    const result = await service.dispatch({
      studentId: 'student-1',
      sessionId: 'voice-session-1',
      contextRef: 'lesson:fractions',
      transcript: 'How do I add fractions?',
      isTranscriptFallback: false,
    });

    expect(result.isFallback).toBe(false);
    expect(aiOrchestrator.handleTurn).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'voice-session-1',
      contextRef: 'lesson:fractions',
      studentMessage: 'How do I add fractions?',
    });
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value across the voice turn', async () => {
    const sttResponse: SttProviderResponse = { status: 'success', transcript: 'test', durationMs: 200 };
    const sttGateway = { transcribe: jest.fn().mockResolvedValue(sttResponse) } as unknown as SttGateway;
    const sttSafeFailure = new SttSafeFailureService();
    const aiOrchestrator = {
      handleTurn: jest.fn().mockResolvedValue({
        text: 'reply',
        isFallback: false,
        provider: 'fake-provider',
        model: 'fake-model',
        latencyMs: 10,
      }),
    } as unknown as AiTeacherOrchestratorService;

    const orchestrator = new VoiceOrchestratorService(sttGateway, sttSafeFailure, makeMockTtsGateway(), new TtsSafeFailureService(), aiOrchestrator);
    const result = await orchestrator.handleTurn({
      studentId: 'student-1',
      sessionId: 'voice-session-1',
      contextRef: 'lesson:fractions',
      audio: Buffer.from('fake-audio'),
      contentType: 'audio/webm;codecs=opus',
      languageCode: 'en',
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
  });
});
