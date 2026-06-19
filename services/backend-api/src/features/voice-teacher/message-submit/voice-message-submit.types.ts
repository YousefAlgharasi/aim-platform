/**
 * P9-050: Build Voice Message Submit Service (Group F — Voice Orchestration
 * With Phase 8 AI Teacher). Input/output contract for submitting a single
 * student voice message: validated audio in, safety-filtered reply text and
 * an optional audio reference out. No mastery/level/weakness/difficulty/
 * recommendation/review-schedule value ever crosses this boundary
 * (docs/phase-9/no-aim-authority-change-rule.md).
 */

export interface SubmitVoiceMessageInput {
  /** Backend-resolved student UUID from the JWT; never a client claim. */
  readonly studentId: string;

  /** Backend-resolved, ownership-validated voice session UUID. */
  readonly sessionId: string;

  /** Opaque context reference resolved by the caller from the session. */
  readonly contextRef: string;

  /** Raw audio Buffer uploaded by the Flutter client. */
  readonly audio: Buffer;

  /** MIME content-type of the audio buffer. */
  readonly mimeType: string;

  /** Declared duration of the audio clip in milliseconds. */
  readonly durationMs: number;

  /** BCP-47 language code resolved by the backend from the student profile. */
  readonly languageCode: string;
}

export interface SubmitVoiceMessageResult {
  readonly messageId: string;
  readonly reply: string;
  readonly audioRef: string | null;
  readonly isFallback: boolean;
}

export interface SubmitVoiceMessageValidationError {
  readonly statusCode: number;
  readonly error: string;
}
