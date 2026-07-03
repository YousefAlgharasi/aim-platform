/**
 * P9-048: Create Voice Orchestrator Skeleton (Group F — Voice Orchestration
 * With Phase 8 AI Teacher). Coordinates a single Voice Mode turn across the
 * already-built Phase 9 Group E (STT pipeline) and Phase 8 Group G (AI
 * Teacher Orchestrator) seams:
 *
 *   1. STT (Group E) — backend-only: transcribes student audio via the STT
 *      Gateway. Audio is never forwarded to Flutter and never persisted raw.
 *      A safe-failure fallback is returned if the STT provider is unavailable
 *      or if no concrete STT_GATEWAY binding has been registered yet.
 *
 *   2. AI Teacher (P8-062) — backend-only: the mapped transcript is passed to
 *      `AiTeacherOrchestratorService.handleTurn()` as the `studentMessage`.
 *      Context is assembled by the existing ContextBuilderService from AIM
 *      Engine / curriculum / student-profile services; this orchestrator
 *      adds nothing to that context and computes no mastery/level/weakness/
 *      difficulty/recommendation/review-schedule value of its own.
 *
 *   3. TTS (Group G) — backend-only: the safety-filtered AI Teacher reply
 *      text is forwarded to the TTS Gateway to produce spoken audio. If
 *      TTS_GATEWAY is not bound or the provider call fails, the orchestrator
 *      returns `audioRef: null` and marks `isFallback: true` so downstream
 *      callers can fall back to text-only gracefully.
 *
 * Authority boundary rules enforced here:
 *   - `studentId` and `sessionId` are backend-resolved and ownership-
 *     validated by the caller before reaching this service.
 *   - The raw audio Buffer is forwarded only to the STT Gateway and is
 *     never logged, stored, or included in any return value.
 *   - No STT, TTS, or AI provider credentials are read, stored, or returned.
 *   - `VoiceTurnResult` carries only safe, provider-agnostic reply text,
 *     an optional audio reference, and operational metadata — never a
 *     mastery/level/weakness/difficulty/recommendation/review-schedule value
 *     (docs/phase-9/no-aim-authority-change-rule.md).
 *   - The AI Teacher's context continues to be assembled exclusively by
 *     ContextBuilderService from upstream AIM Engine / curriculum services.
 *
 * Dependency: P9-046 (STT Gateway pipeline), P8-062 (AI Teacher Orchestrator).
 */

import { Inject, Injectable, Logger, Optional } from '@nestjs/common';

import { AiTeacherOrchestratorService } from '../../ai-teacher/orchestrator/ai-teacher-orchestrator.service';
import {
  STT_GATEWAY,
  SttGateway,
} from '../stt-gateway/stt-gateway.interface';
import { SttSafeFailureService } from '../stt-gateway/stt-safe-failure.service';
import {
  TTS_GATEWAY,
  TtsGateway,
} from '../tts-gateway/tts-gateway.interface';
import { TtsSafeFailureService } from '../tts-gateway/tts-safe-failure.service';
import { VoiceTurnInput, VoiceTurnResult } from './voice-orchestrator.types';

/**
 * Fallback transcript used when the STT Gateway is unavailable (no concrete
 * binding registered yet, or provider returned a non-success response).
 * An empty transcript is forwarded to the AI Teacher, which produces a
 * contextual fallback reply; this matches the "silent/empty recording" path
 * defined in docs/phase-9/stt-output-contract.md.
 */
const STT_FALLBACK_TRANSCRIPT = '';

@Injectable()
export class VoiceOrchestratorService {
  private readonly logger = new Logger(VoiceOrchestratorService.name);

  constructor(
    /**
     * STT Gateway — resolved via the `STT_GATEWAY` Symbol token bound by a
     * future SttGatewayModule (Group E). Declared `@Optional()` so this
     * skeleton compiles and passes type-checks before that module is wired.
     * When null, the orchestrator falls back to an empty transcript and marks
     * `isFallback: true`.
     *
     * Note: The gateway implementation lives entirely on the backend;
     * Flutter never calls it directly.
     */
    @Optional()
    @Inject(STT_GATEWAY)
    private readonly sttGateway: SttGateway | null,

    private readonly sttSafeFailure: SttSafeFailureService,

    /**
     * TTS Gateway — resolved via the `TTS_GATEWAY` Symbol token bound by
     * `TtsGatewayModule`. Declared `@Optional()` for the same reason as
     * `sttGateway`: callers that don't import `TtsGatewayModule` still
     * compile. When null, the orchestrator returns `audioRef: null` and
     * marks `isFallback: true`.
     */
    @Optional()
    @Inject(TTS_GATEWAY)
    private readonly ttsGateway: TtsGateway | null,

    private readonly ttsSafeFailure: TtsSafeFailureService,

    /**
     * Phase 8 AI Teacher Orchestrator (P8-062). Drives context assembly
     * (ContextBuilderService → AIM Engine), prompt building, AI provider
     * call, response safety filtering, and message persistence.
     *
     * This Voice Orchestrator is intentionally a thin coordinator: it
     * forwards the transcript as `studentMessage` and delegates all
     * learning-decision logic to the AI Teacher pipeline, preserving AIM
     * Engine authority.
     */
    private readonly aiTeacherOrchestrator: AiTeacherOrchestratorService,
  ) {}

  /**
   * Execute a full Voice Mode turn: STT → AI Teacher → TTS (placeholder).
   *
   * The caller is responsible for:
   *   - Resolving `studentId` from the JWT and validating session ownership.
   *   - Validating `contentType` before passing `audio`.
   *   - Never trusting `languageCode` as an AIM authority signal; it must
   *     be resolved from the student's backend profile.
   *
   * Returns `VoiceTurnResult` with the safe reply text and, once Group G
   * TTS tasks are complete, an `audioRef`. Until then, `audioRef` is null
   * and `isFallback` is true.
   */
  async handleTurn(input: VoiceTurnInput): Promise<VoiceTurnResult> {
    const turnStart = Date.now();

    this.logger.log(
      `VoiceOrchestratorService.handleTurn: session=${input.sessionId} student=${input.studentId}`,
    );

    // ── Step 1: STT ──────────────────────────────────────────────────────
    // Forward the raw audio to the STT Gateway. The gateway returns a
    // mapped, provider-agnostic SttProviderResponse; raw provider responses
    // and audio buffers never leave the backend.
    let transcript = STT_FALLBACK_TRANSCRIPT;
    let sttIsFallback = false;

    if (this.sttGateway) {
      const sttResponse = await this.sttGateway.transcribe({
        audio: input.audio,
        contentType: input.contentType,
      });

      const safeOutcome = this.sttSafeFailure.toSafeOutcome(sttResponse);
      transcript = safeOutcome.transcript ?? STT_FALLBACK_TRANSCRIPT;
      sttIsFallback = safeOutcome.isFallback;

      if (sttIsFallback) {
        this.logger.warn(
          `VoiceOrchestratorService.handleTurn: STT safe-failure for session=${input.sessionId}`,
        );
      }
    } else {
      // STT_GATEWAY not yet bound — skeleton path.
      sttIsFallback = true;
      this.logger.warn(
        `VoiceOrchestratorService.handleTurn: STT_GATEWAY not bound; using empty transcript for session=${input.sessionId}`,
      );
    }

    // ── Step 2: AI Teacher ───────────────────────────────────────────────
    // Pass the mapped transcript as the student message. Context assembly,
    // mastery/level/weakness/difficulty/recommendation/review-schedule
    // values, and AI provider credentials are all resolved by the AI Teacher
    // pipeline — this orchestrator adds nothing to those decisions.
    const aiResult = await this.aiTeacherOrchestrator.handleTurn({
      studentId: input.studentId,
      sessionId: input.sessionId,
      contextRef: input.contextRef,
      studentMessage: transcript,
    });

    // ── Step 3: TTS ───────────────────────────────────────────────────────
    // Forward the safety-filtered AI Teacher reply text to the TTS Gateway
    // to produce the spoken audio response. If TTS_GATEWAY is not bound, or
    // the provider call fails, audioRef stays null and isFallback is true —
    // the student still gets the text reply either way.
    let audioRef: string | null = null;
    let ttsIsFallback = true;

    if (this.ttsGateway) {
      const ttsResponse = await this.ttsGateway.synthesize({
        text: aiResult.text,
        languageCode: input.languageCode,
        sessionId: input.sessionId,
        studentId: input.studentId,
      });

      const safeOutcome = this.ttsSafeFailure.toSafeOutcome(ttsResponse);
      audioRef = safeOutcome.audioRef;
      ttsIsFallback = safeOutcome.isFallback;

      if (ttsIsFallback) {
        this.logger.warn(
          `VoiceOrchestratorService.handleTurn: TTS safe-failure for session=${input.sessionId}`,
        );
      }
    } else {
      this.logger.warn(
        `VoiceOrchestratorService.handleTurn: TTS_GATEWAY not bound; returning text-only reply for session=${input.sessionId}`,
      );
    }

    const latencyMs = Date.now() - turnStart;

    this.logger.log(
      `VoiceOrchestratorService.handleTurn: completed session=${input.sessionId} latencyMs=${latencyMs}`,
    );

    return {
      text: aiResult.text,
      audioRef,
      isFallback: sttIsFallback || aiResult.isFallback || ttsIsFallback,
      provider: aiResult.provider,
      model: aiResult.model,
      latencyMs,
    };
  }
}
