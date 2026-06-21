/**
 * P9-053: Generate AI Teacher Text Response for Voice (Group F — Voice
 * Orchestration With Phase 8 AI Teacher). Input/output contract for
 * producing a safety-filtered AI Teacher text reply from a backend-mapped
 * STT transcript (P9-044) for an existing, ownership-validated voice
 * session. No mastery/level/weakness/difficulty/recommendation/
 * review-schedule value crosses this boundary
 * (docs/phase-9/no-aim-authority-change-rule.md).
 */

export interface GenerateVoiceResponseInput {
  /** Backend-resolved student UUID from the JWT; never a client claim. */
  readonly studentId: string;

  /** Backend-resolved voice session UUID; ownership validated here. */
  readonly sessionId: string;

  /**
   * Mapped STT transcript text (P9-041/P9-044). May be an empty string for
   * the safe-failure/silent-recording path; never raw provider audio.
   */
  readonly transcript: string;

  /**
   * True when `transcript` is a safe-failure fallback (empty transcript)
   * rather than a live STT result.
   */
  readonly isTranscriptFallback: boolean;
}

export interface GenerateVoiceResponseResult {
  /** Safety-filtered AI Teacher reply text generated from the transcript. */
  readonly text: string;

  /** True if any upstream step (transcript or AI Teacher call) fell back. */
  readonly isFallback: boolean;

  /** AI provider identifier string (opaque, no credentials). */
  readonly provider: string;

  /** AI model identifier string (opaque). */
  readonly model: string;
}
