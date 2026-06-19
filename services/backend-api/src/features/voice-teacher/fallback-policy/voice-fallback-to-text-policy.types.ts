/**
 * P9-056: Add Voice Fallback to Text Policy — types.
 * Input/output contract for deciding how a voice turn is delivered to
 * the student when TTS synthesis is unavailable, per the "TTS provider
 * failure" category of `docs/phase-9/voice-error-policy.md`: the
 * textual reply (already safety-filtered) may still be returned without
 * an `audioRef`, but no broken/placeholder `audioRef` is ever returned.
 * No mastery/level/weakness/difficulty/recommendation/review-schedule
 * value crosses this boundary (docs/phase-9/no-aim-authority-change-rule.md).
 */

/** Input describing the outcome of the TTS step for a single voice turn. */
export interface ResolveVoiceTurnOutputInput {
  /** Already safety-filtered AI Teacher reply text for this turn. */
  readonly replyText: string;

  /** Whether the TTS provider call succeeded and produced usable audio. */
  readonly ttsSucceeded: boolean;

  /** Storage reference for the synthesized audio, or null/undefined if
   *  TTS was not attempted or did not succeed. */
  readonly audioRef?: string | null;
}

/** Resolved delivery for a single voice turn, safe to return to the client. */
export interface VoiceTurnOutput {
  /** The textual reply — always present, since it was already
   *  safety-filtered before this policy runs. */
  readonly text: string;

  /** A valid audio reference, or null when the turn falls back to
   *  text-only delivery. Never a broken/placeholder value. */
  readonly audioRef: string | null;

  /** True when this turn is being delivered as text-only because TTS
   *  was unavailable or failed. */
  readonly isFallbackToText: boolean;
}
