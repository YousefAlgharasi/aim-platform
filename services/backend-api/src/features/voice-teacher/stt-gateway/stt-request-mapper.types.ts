/**
 * P9-040: Create STT Request Mapper.
 * Provider-specific request shape produced from an internal
 * `SttProviderRequest` (stt-gateway.types.ts). This is the only shape a
 * concrete STT provider HTTP client (a later Group E task) may send over
 * the network; it never carries a mastery/level/weakness/difficulty/
 * recommendation/review-schedule value and never carries the provider
 * API key (the key is attached by the HTTP client via
 * `SttGatewayConfigService`, never embedded in the request body).
 */
export interface SttCompletionRequest {
  readonly model: string;
  readonly audio: Buffer;
  readonly contentType: string;
}
