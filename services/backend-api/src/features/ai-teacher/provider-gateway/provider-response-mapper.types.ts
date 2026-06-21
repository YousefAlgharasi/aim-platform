/**
 * P8-056: Create AI Provider Response Mapper.
 * Raw, provider-specific completion response shape and the input the
 * mapper needs to convert it into the internal `AiProviderResponse`
 * contract (provider-gateway.types.ts). The raw shape never carries a
 * mastery/level/weakness/difficulty/recommendation/review-schedule value
 * and is never logged or returned to Flutter as-is
 * (docs/phase-8/privacy-policy.md); only the mapped `AiProviderResponse`
 * crosses this boundary.
 */
export interface ProviderCompletionResponseChoice {
  readonly message: {
    readonly content: string | null;
  };
}

export interface ProviderCompletionResponse {
  readonly choices: ProviderCompletionResponseChoice[];
}

export interface ProviderResponseMapperInput {
  readonly provider: string;
  readonly model: string;
  readonly latencyMs: number;
  readonly raw: ProviderCompletionResponse | null;
  readonly errorCategory?: string | null;
}
