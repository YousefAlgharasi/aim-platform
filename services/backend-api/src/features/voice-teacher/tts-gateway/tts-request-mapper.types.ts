/**
 * P9-060: Create TTS Request Mapper.
 * Provider-specific request shape produced from an internal
 * `TtsProviderRequest` (tts-gateway.types.ts). This is the only shape a
 * concrete TTS provider HTTP client (a later Group G task) may send over
 * the network; it never carries a mastery/level/weakness/difficulty/
 * recommendation/review-schedule value and never carries the provider
 * API key (the key is attached by the HTTP client via
 * `TtsGatewayConfigService`, never embedded in the request body).
 */
export interface TtsCompletionRequest {
  readonly model: string;
  readonly text: string;
  readonly languageCode: string;
}
