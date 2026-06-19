export interface TtsProviderRequest {
  readonly text: string;
  readonly languageCode: string;
}

export type TtsProviderResponseStatus = 'success' | 'error' | 'timeout';

export interface TtsProviderResponse {
  readonly status: TtsProviderResponseStatus;
  readonly audioRef: string | null;
  readonly durationMs: number | null;
  readonly contentType: string | null;
  readonly errorCategory?: string | null;
}
