// P9-048: Voice Orchestrator — unit tests.
// Verifies the orchestrator's coordination logic:
//   1. STT gateway is called with the raw audio; its safe-failure path
//      is honoured (empty transcript + isFallback=true) when unavailable.
//   2. AI Teacher orchestrator receives the transcript as studentMessage;
//      its result drives the return value.
//   3. TTS gateway is called with the AI Teacher reply text; audioRef is
//      populated on success and null (with isFallback=true) on failure or
//      when TTS_GATEWAY is unbound.
//   4. No mastery/level/weakness/difficulty/recommendation/review-schedule
//      value is ever computed or returned (AIM authority check).
//   5. No provider credentials or raw audio bytes appear in the result.

import { Logger } from '@nestjs/common';

import { AiTeacherOrchestratorService } from '../../../ai-teacher/orchestrator/ai-teacher-orchestrator.service';
import { SttGateway } from '../../stt-gateway/stt-gateway.interface';
import { SttSafeFailureService } from '../../stt-gateway/stt-safe-failure.service';
import { SttProviderResponse } from '../../stt-gateway/stt-gateway.types';
import { TtsGateway } from '../../tts-gateway/tts-gateway.interface';
import { TtsSafeFailureService } from '../../tts-gateway/tts-safe-failure.service';
import { TtsProviderResponse } from '../../tts-gateway/tts-gateway.types';
import { VoiceOrchestratorService } from '../voice-orchestrator.service';
import { VoiceTurnInput } from '../voice-orchestrator.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeInput = (overrides: Partial<VoiceTurnInput> = {}): VoiceTurnInput => ({
  studentId: 'student-001',
  sessionId: 'session-001',
  contextRef: 'ctx-ref-001',
  audio: Buffer.from('fake-audio'),
  contentType: 'audio/webm;codecs=opus',
  languageCode: 'ar',
  ...overrides,
});

const makeAiResult = (overrides: Record<string, unknown> = {}) => ({
  text: 'AI Teacher reply',
  isFallback: false,
  provider: 'anthropic',
  model: 'claude-3-haiku',
  latencyMs: 120,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const buildMockSttGateway = (response: SttProviderResponse): jest.Mocked<SttGateway> =>
  ({ transcribe: jest.fn().mockResolvedValue(response) } as unknown as jest.Mocked<SttGateway>);

const FALLBACK_TTS_RESPONSE: TtsProviderResponse = {
  status: 'error',
  audioRef: null,
  durationMs: null,
  contentType: null,
  errorCategory: 'TTS_NOT_CONFIGURED_IN_TEST',
};

const buildMockTtsGateway = (
  response: TtsProviderResponse = FALLBACK_TTS_RESPONSE,
): jest.Mocked<TtsGateway> =>
  ({ synthesize: jest.fn().mockResolvedValue(response) } as unknown as jest.Mocked<TtsGateway>);

const buildMockAiOrchestrator = (
  result: ReturnType<typeof makeAiResult>,
): jest.Mocked<AiTeacherOrchestratorService> =>
  ({ handleTurn: jest.fn().mockResolvedValue(result) } as unknown as jest.Mocked<AiTeacherOrchestratorService>);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('VoiceOrchestratorService', () => {
  let sttSafeFailure: SttSafeFailureService;
  let ttsSafeFailure: TtsSafeFailureService;

  beforeEach(() => {
    sttSafeFailure = new SttSafeFailureService();
    ttsSafeFailure = new TtsSafeFailureService();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  // ── Happy path ────────────────────────────────────────────────────────────

  describe('handleTurn — STT success + AI Teacher success', () => {
    it('returns AI Teacher reply text and the synthesised audioRef', async () => {
      const sttResponse: SttProviderResponse = {
        status: 'success',
        transcript: 'مرحباً',
        durationMs: 800,
      };
      const aiResult = makeAiResult();
      const ttsGateway = buildMockTtsGateway({
        status: 'success',
        audioRef: 'tts_ref_123',
        durationMs: 500,
        contentType: 'audio/mpeg',
      });
      const svc = new VoiceOrchestratorService(
        buildMockSttGateway(sttResponse),
        sttSafeFailure,
        ttsGateway,
        ttsSafeFailure,
        buildMockAiOrchestrator(aiResult),
      );

      const result = await svc.handleTurn(makeInput());

      expect(result.text).toBe('AI Teacher reply');
      expect(result.audioRef).toBe('tts_ref_123');
      expect(result.isFallback).toBe(false);
      expect(result.provider).toBe('anthropic');
      expect(result.model).toBe('claude-3-haiku');
      expect(ttsGateway.synthesize).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'AI Teacher reply', languageCode: 'ar' }),
      );
    });

    it('forwards the STT transcript as studentMessage to AI Teacher', async () => {
      const sttResponse: SttProviderResponse = {
        status: 'success',
        transcript: 'كيف حالك',
        durationMs: 600,
      };
      const aiOrchestrator = buildMockAiOrchestrator(makeAiResult());
      const svc = new VoiceOrchestratorService(
        buildMockSttGateway(sttResponse),
        sttSafeFailure,
        buildMockTtsGateway(),
        ttsSafeFailure,
        aiOrchestrator,
      );

      await svc.handleTurn(makeInput());

      expect(aiOrchestrator.handleTurn).toHaveBeenCalledWith(
        expect.objectContaining({ studentMessage: 'كيف حالك' }),
      );
    });

    it('forwards studentId, sessionId, and contextRef to AI Teacher unchanged', async () => {
      const sttResponse: SttProviderResponse = {
        status: 'success',
        transcript: 'hello',
        durationMs: 400,
      };
      const aiOrchestrator = buildMockAiOrchestrator(makeAiResult());
      const svc = new VoiceOrchestratorService(
        buildMockSttGateway(sttResponse),
        sttSafeFailure,
        buildMockTtsGateway(),
        ttsSafeFailure,
        aiOrchestrator,
      );
      const input = makeInput({
        studentId: 'student-xyz',
        sessionId: 'session-abc',
        contextRef: 'ctx-def',
      });

      await svc.handleTurn(input);

      expect(aiOrchestrator.handleTurn).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 'student-xyz',
          sessionId: 'session-abc',
          contextRef: 'ctx-def',
        }),
      );
    });

    it('isFallback is true and audioRef is null when the TTS gateway call fails', async () => {
      const sttResponse: SttProviderResponse = {
        status: 'success',
        transcript: 'test',
        durationMs: 300,
      };
      const aiResult = makeAiResult({ isFallback: false });
      const svc = new VoiceOrchestratorService(
        buildMockSttGateway(sttResponse),
        sttSafeFailure,
        buildMockTtsGateway(),
        ttsSafeFailure,
        buildMockAiOrchestrator(aiResult),
      );

      const result = await svc.handleTurn(makeInput());

      expect(result.audioRef).toBeNull();
      expect(result.isFallback).toBe(true);
    });

    it('falls back to text-only gracefully when TTS_GATEWAY is null (binding not registered)', async () => {
      const sttResponse: SttProviderResponse = {
        status: 'success',
        transcript: 'test',
        durationMs: 300,
      };
      const aiResult = makeAiResult({ isFallback: false });
      const svc = new VoiceOrchestratorService(
        buildMockSttGateway(sttResponse),
        sttSafeFailure,
        null,
        ttsSafeFailure,
        buildMockAiOrchestrator(aiResult),
      );

      const result = await svc.handleTurn(makeInput());

      expect(result.text).toBe('AI Teacher reply');
      expect(result.audioRef).toBeNull();
      expect(result.isFallback).toBe(true);
    });
  });

  // ── STT safe-failure path ─────────────────────────────────────────────────

  describe('handleTurn — STT failure', () => {
    it('uses empty transcript and isFallback=true when STT returns error status', async () => {
      const sttResponse: SttProviderResponse = {
        status: 'error',
        transcript: null,
        durationMs: null,
        errorCategory: 'network',
      };
      const aiOrchestrator = buildMockAiOrchestrator(makeAiResult());
      const svc = new VoiceOrchestratorService(
        buildMockSttGateway(sttResponse),
        sttSafeFailure,
        buildMockTtsGateway(),
        ttsSafeFailure,
        aiOrchestrator,
      );

      const result = await svc.handleTurn(makeInput());

      // AI Teacher is still called, but with an empty transcript.
      expect(aiOrchestrator.handleTurn).toHaveBeenCalledWith(
        expect.objectContaining({ studentMessage: '' }),
      );
      expect(result.isFallback).toBe(true);
    });

    it('uses empty transcript and isFallback=true when STT returns timeout status', async () => {
      const sttResponse: SttProviderResponse = {
        status: 'timeout',
        transcript: null,
        durationMs: null,
      };
      const aiOrchestrator = buildMockAiOrchestrator(makeAiResult());
      const svc = new VoiceOrchestratorService(
        buildMockSttGateway(sttResponse),
        sttSafeFailure,
        buildMockTtsGateway(),
        ttsSafeFailure,
        aiOrchestrator,
      );

      await svc.handleTurn(makeInput());

      expect(aiOrchestrator.handleTurn).toHaveBeenCalledWith(
        expect.objectContaining({ studentMessage: '' }),
      );
    });

    it('falls back gracefully when STT_GATEWAY is null (binding not yet registered)', async () => {
      const aiOrchestrator = buildMockAiOrchestrator(makeAiResult());
      // Pass null as the STT gateway — simulates skeleton state before SttGatewayModule is wired.
      const svc = new VoiceOrchestratorService(
        null,
        sttSafeFailure,
        buildMockTtsGateway(),
        ttsSafeFailure,
        aiOrchestrator,
      );

      const result = await svc.handleTurn(makeInput());

      expect(aiOrchestrator.handleTurn).toHaveBeenCalledWith(
        expect.objectContaining({ studentMessage: '' }),
      );
      expect(result.isFallback).toBe(true);
    });
  });

  // ── AIM authority check ───────────────────────────────────────────────────

  describe('AIM authority boundary', () => {
    it('result contains no mastery, level, weakness, difficulty, recommendation, or review-schedule field', async () => {
      const sttResponse: SttProviderResponse = {
        status: 'success',
        transcript: 'test',
        durationMs: 200,
      };
      const svc = new VoiceOrchestratorService(
        buildMockSttGateway(sttResponse),
        sttSafeFailure,
        buildMockTtsGateway(),
        ttsSafeFailure,
        buildMockAiOrchestrator(makeAiResult()),
      );

      const result = await svc.handleTurn(makeInput());

      const forbiddenFields = [
        'mastery',
        'level',
        'weakness',
        'difficulty',
        'recommendation',
        'reviewSchedule',
        'review_schedule',
        'skillCode',
        'skill_code',
      ] as const;

      for (const field of forbiddenFields) {
        expect(result).not.toHaveProperty(field);
      }
    });

    it('result never contains provider credentials or raw audio bytes', async () => {
      const sttResponse: SttProviderResponse = {
        status: 'success',
        transcript: 'test',
        durationMs: 200,
      };
      const svc = new VoiceOrchestratorService(
        buildMockSttGateway(sttResponse),
        sttSafeFailure,
        buildMockTtsGateway(),
        ttsSafeFailure,
        buildMockAiOrchestrator(makeAiResult()),
      );

      const result = await svc.handleTurn(makeInput());
      const resultStr = JSON.stringify(result);

      expect(result).not.toHaveProperty('audio');
      expect(result).not.toHaveProperty('apiKey');
      expect(result).not.toHaveProperty('token');
      expect(resultStr).not.toContain('fake-audio'); // raw audio not echoed back
    });
  });

  // ── latencyMs ─────────────────────────────────────────────────────────────

  it('returns a non-negative latencyMs value', async () => {
    const sttResponse: SttProviderResponse = {
      status: 'success',
      transcript: 'test',
      durationMs: 100,
    };
    const svc = new VoiceOrchestratorService(
      buildMockSttGateway(sttResponse),
      sttSafeFailure,
      buildMockTtsGateway(),
      ttsSafeFailure,
      buildMockAiOrchestrator(makeAiResult()),
    );

    const result = await svc.handleTurn(makeInput());

    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.latencyMs).toBe('number');
  });
});
