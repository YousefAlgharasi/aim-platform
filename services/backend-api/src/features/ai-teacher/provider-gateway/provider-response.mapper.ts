/**
 * P8-056: Create AI Provider Response Mapper.
 * Converts a raw, provider-specific `ProviderCompletionResponse` (or an
 * already-known error category, e.g. from an HTTP client catch block)
 * into the internal `AiProviderResponse` contract (Group F) consumed by
 * `ProviderGatewaySafeFailureService` (P8-058) and
 * `ProviderGatewayLoggingService` (P8-059). This mapper performs no
 * database access, no AI provider call, and computes no mastery/level/
 * weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md); a missing or empty raw
 * response is mapped to a safe `error` status, never invented text.
 */
import { Injectable } from '@nestjs/common';

import { AiProviderResponse } from './provider-gateway.types';
import { ProviderResponseMapperInput } from './provider-response-mapper.types';

const EMPTY_RESPONSE_ERROR_CATEGORY = 'PROVIDER_EMPTY_RESPONSE';
const MISSING_RESPONSE_ERROR_CATEGORY = 'PROVIDER_CALL_FAILED';

@Injectable()
export class ProviderResponseMapperService {
  mapResponse(input: ProviderResponseMapperInput): AiProviderResponse {
    const { provider, model, latencyMs } = input;

    if (input.errorCategory) {
      return {
        status: 'error',
        text: null,
        provider,
        model,
        latencyMs,
        errorCategory: input.errorCategory,
      };
    }

    if (!input.raw) {
      return {
        status: 'error',
        text: null,
        provider,
        model,
        latencyMs,
        errorCategory: MISSING_RESPONSE_ERROR_CATEGORY,
      };
    }

    const text = input.raw.choices[0]?.message?.content ?? null;

    if (!this.hasUsableText(text)) {
      return {
        status: 'error',
        text: null,
        provider,
        model,
        latencyMs,
        errorCategory: EMPTY_RESPONSE_ERROR_CATEGORY,
      };
    }

    return {
      status: 'success',
      text,
      provider,
      model,
      latencyMs,
    };
  }

  private hasUsableText(text: string | null): boolean {
    return typeof text === 'string' && text.trim().length > 0;
  }
}
