export type TtsAudioAssetStatus = 'generating' | 'ready' | 'failed';

/** What identifies one generated audio file. Any change here must produce a different asset. */
export interface TtsAudioAssetKey {
  readonly contentHash: string;
  readonly language: string;
  readonly voiceConfigHash: string;
}

export interface TtsAudioAssetRow {
  readonly id: string;
  readonly question_id: string | null;
  readonly language: string;
  readonly content_hash: string;
  readonly voice_config_hash: string;
  readonly status: TtsAudioAssetStatus;
  readonly storage_path: string | null;
  readonly mime_type: string | null;
  readonly size_bytes: string | number | null;
  readonly duration_ms: number | null;
  readonly lease_owner: string | null;
  readonly lease_expires_at: Date | null;
  readonly attempt_count: number;
  readonly last_error: string | null;
}

export interface TtsAudioAssetReadyInput {
  readonly storagePath: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly durationMs: number | null;
}

/** Audio bytes plus what a caller needs to deliver them. */
export interface ResolvedTtsAudio {
  readonly data: Buffer;
  readonly contentType: string;
  readonly durationMs: number | null;
}

export interface TtsAudioAssetRequest {
  /** Informational only (first requester); not part of the asset identity. */
  readonly questionId: string | null;
  readonly script: string;
  readonly languageCode: string;
  /** Scopes the gateway's transient output only; it is never written to Storage or the table. */
  readonly studentId: string;
}
