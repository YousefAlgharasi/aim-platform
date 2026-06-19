/**
 * P9-033: Add Audio Cleanup Policy.
 * Types for the audio cleanup/retention system.
 * No STT/TTS/AI provider credentials, AIM Engine-owned fields,
 * raw audio bytes, or filesystem paths cross this boundary.
 */

/** Reason an audio asset qualifies for deletion. */
export type AudioCleanupReason =
  /** STT transcription completed — uploaded audio no longer needed. */
  | 'transcription_complete'
  /** Session ended before STT completed — audio orphaned. */
  | 'session_ended_before_transcription'
  /** TTS audio has been delivered to the client or session has ended. */
  | 'tts_audio_delivered_or_session_ended'
  /** Hard cap: session is older than the maximum retention window. */
  | 'max_retention_exceeded';

export interface EligibleAudioAsset {
  /** voice_audio_assets.id */
  readonly assetId: string;
  /** voice_audio_assets.storage_key — opaque, never a filesystem path. */
  readonly storageKey: string;
  /** voice_audio_assets.message_id */
  readonly messageId: string;
  readonly reason: AudioCleanupReason;
}

export interface AudioCleanupResult {
  /** Number of assets successfully deleted (storage + DB row). */
  readonly deleted: number;
  /** Number of assets that failed deletion (logged, not re-thrown). */
  readonly failed: number;
}

export interface AudioCleanupPolicyConfig {
  /**
   * Maximum age in milliseconds for any audio asset, regardless of
   * session or message status. Default: 7 days.
   */
  readonly maxRetentionMs: number;
}
