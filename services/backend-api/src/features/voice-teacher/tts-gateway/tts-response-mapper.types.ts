export interface TtsCompletionResponse {
  readonly audioRef: string | null;
  readonly durationMs: number | null;
  readonly contentType: string | null;
}

export interface TtsResponseMapperInput {
  readonly raw: TtsCompletionResponse | null;
  readonly errorCategory?: string | null;
}
