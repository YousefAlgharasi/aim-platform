export interface TtsAudioStorageInput {
  readonly audioRef: string;
  readonly audioData: Buffer;
  readonly contentType: string;
  readonly durationMs: number | null;
  readonly sessionId: string;
  readonly studentId: string;
}

export interface TtsAudioStorageResult {
  readonly audioRef: string;
  readonly stored: boolean;
  readonly errorCategory?: string | null;
}
