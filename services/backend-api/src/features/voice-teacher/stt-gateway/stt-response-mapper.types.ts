/**
 * P9-041: Create STT Response Mapper.
 * Raw, provider-specific transcription response shape and the input the
 * mapper needs to convert it into the internal `SttProviderResponse`
 * contract (stt-gateway.types.ts), which matches
 * docs/phase-9/stt-output-contract.md exactly. The raw shape never
 * carries a mastery/level/weakness/difficulty/recommendation/
 * review-schedule value and is never logged or returned to Flutter as-is
 * (docs/phase-9/voice-privacy-policy.md); only the mapped
 * `SttProviderResponse` crosses this boundary.
 */
export interface SttCompletionResponse {
  readonly text: string | null;
  readonly durationMs: number | null;
}

export interface SttResponseMapperInput {
  readonly latencyMs: number;
  readonly raw: SttCompletionResponse | null;
  readonly errorCategory?: string | null;
}
