/**
 * P9-061: Create TTS Response Mapper.
 * Raw, provider-specific synthesis response shape and the input the
 * mapper needs to convert it into the internal `TtsProviderResponse`
 * contract (tts-gateway.types.ts), which matches
 * docs/phase-9/tts-output-contract.md exactly. The raw shape never
 * carries a mastery/level/weakness/difficulty/recommendation/
 * review-schedule value and is never logged or returned to Flutter as-is
 * (docs/phase-9/voice-privacy-policy.md); only the mapped
 * `TtsProviderResponse` crosses this boundary.
 */
export interface TtsCompletionResponse {
  readonly audioRef: string | null;
  readonly durationMs: number | null;
  readonly contentType: string | null;
}

export interface TtsResponseMapperInput {
  readonly raw: TtsCompletionResponse | null;
  readonly errorCategory?: string | null;
}
