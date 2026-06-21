/**
 * P9-054: Persist Voice Conversation Messages (Group F — Voice
 * Orchestration With Phase 8 AI Teacher). Input/output contract for
 * storing a completed voice turn — the mapped STT transcript and the
 * AI Teacher text response — onto the existing `voice_messages` (P9-019)
 * and `voice_transcripts` (P9-021) rows. No mastery/level/weakness/
 * difficulty/recommendation/review-schedule value crosses this boundary
 * (docs/phase-9/no-aim-authority-change-rule.md).
 */

export interface PersistVoiceTurnInput {
  /** Pending `voice_messages` row created at upload time (P9-028). */
  readonly messageId: string;

  /** Owning voice session UUID. */
  readonly sessionId: string;

  /** Mapped STT transcript text (P9-041/P9-044). */
  readonly transcript: string;

  /** BCP-47 language code resolved by the backend, or null if unknown. */
  readonly languageCode: string | null;

  /** STT confidence score (0..1), or null if unavailable. */
  readonly confidence: number | null;

  /** AI Teacher reply text (P9-053). */
  readonly reply: string;
}

export interface PersistVoiceTurnResult {
  readonly messageId: string;
  readonly transcriptId: string;
}
