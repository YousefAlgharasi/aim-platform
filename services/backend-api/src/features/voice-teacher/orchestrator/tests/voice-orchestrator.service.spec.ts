// P9-048: Create Voice Orchestrator Skeleton — unit tests.
// Verifies the skeleton's coordination logic:
//   1. STT gateway is called with the raw audio; its safe-failure path
//      is honoured (empty transcript + isFallback=true) when unavailable.
//   2. AI Teacher orchestrator receives the transcript as studentMessage;
//      its result drives the return value.
//   3. audioRef is null and isFallback is true for the TTS placeholder seam.
//   4. No mastery/level/weakness/difficulty/recommendation/review-schedule
//      value is ever computed or returned (AIM authority check).
//   5. No provider credentials or raw audio bytes appear in the result.

import { Logger } from '@nestjs/common';

import { AiTeacherOrchestratorService } from '../../../ai-teacher/orchestrator/ai-teacher-orchestrator.service';
import { SttGateway } from '../../stt-gateway/stt-gateway.interface';
import { SttSafeFailureService } from '../../stt-gateway/stt-safe-failure.service';
import { SttProviderResponse } from '../../stt-gateway/stt-gateway.types';
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

const buildMockAiOrchestrator = (
  result: ReturnType<typeof makeAiResult>,
): jest.Mocked<AiTeacherOrchestratorService> =>
  ({ handleTurn: jest.fn().mockResolvedValue(result) } as unknown as jest.Mocked<AiTeacherOrchestratorService>);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('VoiceOrchestratorService', () => {
  let sttSafeFailure: SttSafeFailureService;

  beforeEach(() => {
    sttSafeFailure = new SttSafeFailureService();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  // ── Happy path ────────────────────────────────────────────────────────────

  describe('handleTurn — STT success + AI Teacher success', () => {
    it('returns AI Teacher reply text and null audioRef', async () => {
      const sttResponse: SttProviderResponse = {
        status: 'success',
        transcript: 'مرحباً',
        durationMs: 800,
      };
      const aiResult = makeAiResult();
      const svc = new VoiceOrchestratorService(
        buildMockSttGateway(sttResponse),
        sttSafeFailure,
        buildMockAiOrchestrator(aiResult),
      );

      const result = await svc.handleTurn(makeInput());

      expect(result.text).toBe('AI Teacher reply');
      expect(result.audioRef).toBeNull(); // TTS not yet wired
      expect(result.provider).toBe('anthropic');
      expect(result.model).toBe('claude-3-haiku');
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

    it('isFallback is true because TTS is not yet wired (Group G placeholder)', async () => {
      const sttResponse: SttProviderResponse = {
        status: 'success',
        transcript: 'test',
        durationMs: 300,
      };
      const aiResult = makeAiResult({ isFallback: false });
      const svc = new VoiceOrchestratorService(
        buildMockSttGateway(sttResponse),
        sttSafeFailure,
        buildMockAiOrchestrator(aiResult),
      );

      const result = await svc.handleTurn(makeInput());

      // TTS placeholder always sets isFallback=true until Group G is wired.
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
      const svc = new VoiceOrchestratorService(null, sttSafeFailure, aiOrchestrator);

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
      buildMockAiOrchestrator(makeAiResult()),
    );

    const result = await svc.handleTurn(makeInput());

    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.latencyMs).toBe('number');
  });
});
