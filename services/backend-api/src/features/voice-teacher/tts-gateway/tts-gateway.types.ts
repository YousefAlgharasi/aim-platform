export interface TtsProviderRequest {
  readonly text: string;
  readonly languageCode: string;
  /** Backend-resolved session UUID, used only to scope stored audio. */
  readonly sessionId: string;
  /** Backend-resolved student UUID, used only to scope stored audio. */
  readonly studentId: string;
}

export type TtsProviderResponseStatus = 'success' | 'error' | 'timeout';

export interface TtsProviderResponse {
  readonly status: TtsProviderResponseStatus;
  readonly audioRef: string | null;
  readonly durationMs: number | null;
  readonly contentType: string | null;
  readonly errorCategory?: string | null;
}
