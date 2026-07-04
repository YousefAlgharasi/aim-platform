/**
 * P9-032: Persist Audio Metadata.
 * Input/output types for AudioMetadataPersistenceService.
 * No STT/TTS/AI provider credentials, AIM Engine-owned fields,
 * raw filesystem paths, or public audio URLs cross this boundary.
 */

export interface AudioMetadataPersistenceInput {
  /**
   * P21-021b: ID of the ai_chat_messages placeholder row created by
   * AudioUploadService (was the voice_messages row before this task).
   */
  readonly aiChatMessageId: string;
  /** Student who owns the session; verified upstream before this call. */
  readonly studentId: string;
  /** Validated audio bytes (magic-byte + duration checks already passed). */
  readonly audio: Buffer;
  /** MIME type declared by the client and confirmed via magic-byte sniff. */
  readonly contentType: string;
  /**
   * Actual audio duration in milliseconds decoded from the container
   * header (not the client-declared value). Used for DB record only.
   */
  readonly durationMs: number;
}

export interface AudioMetadataPersistenceResult {
  /** Opaque UUID of the new voice_audio_assets row. */
  readonly assetId: string;
  /**
   * Opaque storage key returned by AudioStorageAdapter.write().
   * Never a filesystem path or public URL. Kept here so the
   * AudioUploadService can include it in logs if needed; it must
   * never be forwarded to the Flutter client.
   */
  readonly storageKey: string;
}
