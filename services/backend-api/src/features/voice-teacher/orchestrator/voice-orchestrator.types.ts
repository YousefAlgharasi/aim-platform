/**
 * P9-048: Create Voice Orchestrator Skeleton (Group F — Voice Orchestration
 * With Phase 8 AI Teacher). Input/output contract for a single Voice Mode
 * turn.
 *
 * Authority boundary rules:
 *   - `VoiceTurnInput.studentId` and `sessionId` are backend-resolved by
 *     the caller after JWT validation; they are never accepted as trusted
 *     client-provided learning-decision values.
 *   - `VoiceTurnInput.audio` is a raw Buffer received from the Flutter
 *     client; it is forwarded only to the STT Gateway and is never logged,
 *     stored, or echoed back to any response.
 *   - `VoiceTurnResult` carries only the student-safe, provider-agnostic
 *     reply text, an optional audio reference, and operational metadata.
 *     It never carries a mastery/level/weakness/difficulty/recommendation/
 *     review-schedule value (docs/phase-9/no-aim-authority-change-rule.md).
 *   - `VoiceTurnResult.audioRef` is an opaque storage reference; it is
 *     never a signed provider URL, raw audio bytes, or provider credential.
 *
 * Dependency: P9-046 (STT Gateway pipeline), P8-062 (AI Teacher Orchestrator).
 */

export interface VoiceTurnInput {
  /** Backend-resolved student UUID from the JWT; never a client claim. */
  readonly studentId: string;

  /** Backend-resolved voice session UUID; ownership-validated by caller. */
  readonly sessionId: string;

  /**
   * Opaque context reference linking this turn to the backend-approved
   * AI Teacher context snapshot. Resolved by the caller from the session
   * record; never forwarded to Flutter as a learning-decision parameter.
   */
  readonly contextRef: string;

  /**
   * Raw audio Buffer uploaded by the Flutter client (e.g. Opus/WebM/WAV).
   * Forwarded to the STT Gateway only; never logged, persisted, or echoed
   * back to any response. Content-type must be validated by the caller.
   */
  readonly audio: Buffer;

  /**
   * MIME content-type of the audio buffer (e.g. "audio/webm;codecs=opus").
   * Validated by the caller before it reaches the orchestrator.
   */
  readonly contentType: string;

  /**
   * BCP-47 language code for STT transcription (e.g. "ar", "en-US").
   * Resolved by the backend from the student's profile; never a raw
   * client-provided string used as an AIM authority signal.
   */
  readonly languageCode: string;
}

export interface VoiceTurnResult {
  /**
   * Safety-filtered AI Teacher reply text. Never a raw provider response
   * and never a mastery/level/weakness/difficulty/recommendation/
   * review-schedule value.
   */
  readonly text: string;

  /**
   * Opaque storage reference for the synthesised audio file produced by
   * the TTS Gateway, or null if TTS is not yet wired (Group G tasks).
   * Never a signed provider URL or raw audio bytes.
   */
  readonly audioRef: string | null;

  /**
   * True if either the AI Teacher or TTS gateway returned a safe-failure
   * fallback rather than a live provider response. The caller surfaces
   * this as a retry hint only — never as a mastery/level/difficulty signal.
   */
  readonly isFallback: boolean;

  /**
   * AI provider identifier string (opaque, no credentials). For
   * observability only; never returned to Flutter.
   */
  readonly provider: string;

  /**
   * AI model identifier string (opaque). For observability only.
   */
  readonly model: string;

  /**
   * End-to-end latency in milliseconds for the full Voice turn
   * (STT + AI Teacher + TTS). For observability only.
   */
  readonly latencyMs: number;
}
