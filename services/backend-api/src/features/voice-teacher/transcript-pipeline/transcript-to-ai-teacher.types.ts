/**
 * P9-051: Connect Transcript to Phase 8 AI Teacher Pipeline (Group F —
 * Voice Orchestration With Phase 8 AI Teacher). Input/output contract for
 * forwarding a backend-mapped STT transcript (P9-044) into the existing
 * Phase 8 AI Teacher Orchestrator (P8-062). No mastery/level/weakness/
 * difficulty/recommendation/review-schedule value crosses this boundary
 * (docs/phase-9/no-aim-authority-change-rule.md).
 */

export interface DispatchTranscriptInput {
  /** Backend-resolved student UUID from the JWT; never a client claim. */
  readonly studentId: string;

  /** Backend-resolved, ownership-validated voice session UUID. */
  readonly sessionId: string;

  /** Opaque context reference resolved by the caller from the session. */
  readonly contextRef: string;

  /**
   * Mapped STT transcript text (P9-041/P9-044). May be an empty string for
   * the safe-failure/silent-recording path; never raw provider audio.
   */
  readonly transcript: string;

  /**
   * True when `transcript` is a safe-failure fallback (empty transcript)
   * rather than a live STT result. Forwarded so the result's `isFallback`
   * reflects the full pipeline, not just the AI Teacher call.
   */
  readonly isTranscriptFallback: boolean;
}

export interface DispatchTranscriptResult {
  /** Safety-filtered AI Teacher reply text. */
  readonly text: string;

  /** True if the transcript or the AI Teacher call used a safe-failure path. */
  readonly isFallback: boolean;

  /** AI provider identifier string (opaque, no credentials). */
  readonly provider: string;

  /** AI model identifier string (opaque). */
  readonly model: string;
}
