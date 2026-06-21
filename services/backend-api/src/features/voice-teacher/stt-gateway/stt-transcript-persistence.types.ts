/**
 * P9-044: Persist STT Transcript — row types.
 * Mirrors the voice_transcripts migration columns (P9-021) exactly.
 * No mastery, level, weakness, difficulty, recommendation, or
 * review-schedule fields exist here — that remains AIM Engine authority
 * (docs/phase-9/no-aim-authority-change-rule.md).
 *
 * `confidence` is an advisory quality signal in [0, 1]; it is never used
 * as a mastery or difficulty decision.
 * `segments` is optional word-level timing data from the STT Gateway;
 * it is stored as-is from the mapped response and never returned raw to
 * Flutter.
 * `provider_ref` links to voice_provider_logs(id) for observability;
 * it carries no credentials.
 */

export interface VoiceTranscriptRow {
  readonly id: string;
  readonly message_id: string;
  readonly session_id: string;
  readonly transcript_text: string;
  readonly language_code: string | null;
  readonly confidence: number | null;
  readonly segments: unknown | null;
  readonly provider_ref: string | null;
  readonly created_at: string;
}

export interface CreateVoiceTranscriptInput {
  /** FK to voice_messages(id). Backend-resolved after ownership check. */
  readonly messageId: string;
  /** FK to voice_sessions(id). Denormalised for fast per-session queries. */
  readonly sessionId: string;
  /**
   * Mapped, safety-filtered transcript text from the STT Gateway.
   * Never a raw provider response body or prompt content.
   */
  readonly transcriptText: string;
  /** BCP-47 language tag from the STT Gateway, e.g. "ar" or "en-US". */
  readonly languageCode?: string | null;
  /**
   * STT provider confidence in [0, 1]. Advisory quality signal only;
   * never a mastery, level, or difficulty decision.
   */
  readonly confidence?: number | null;
  /**
   * Optional word/phrase-level timing segments from the STT Gateway,
   * already mapped and filtered. Null if the provider did not return
   * segment data.
   */
  readonly segments?: unknown | null;
  /**
   * Opaque reference to the voice_provider_logs(id) row for the STT
   * call that produced this transcript. Backend-resolved; never a
   * provider API key or credential.
   */
  readonly providerRef?: string | null;
}
