/**
 * P8-055: Create AI Provider Request Mapper.
 * Provider-specific request shape produced from an internal
 * `AiProviderRequest` (provider-gateway.types.ts). This is the only shape
 * a concrete provider HTTP client (a later Group F task) may send over
 * the network; it never carries a mastery/level/weakness/difficulty/
 * recommendation/review-schedule value and never carries the provider
 * API key (the key is attached by the HTTP client via
 * `ProviderGatewayConfigService`, never embedded in the request body).
 */
export type ProviderChatRole = 'system' | 'user';

export interface ProviderChatMessage {
  readonly role: ProviderChatRole;
  readonly content: string;
}

export interface ProviderCompletionRequest {
  readonly model: string;
  readonly messages: ProviderChatMessage[];
}
