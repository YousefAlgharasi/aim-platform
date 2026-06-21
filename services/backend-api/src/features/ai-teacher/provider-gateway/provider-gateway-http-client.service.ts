/**
 * P8-065: Build AI Response Generation Flow (Group G — AI Teacher Backend
 * Pipeline). Concrete `AiProviderGateway` implementation — the only
 * backend-internal seam that ever sends a network request to the AI
 * provider (docs/phase-8/no-client-ai-provider-rule.md). Flutter never
 * has network access to a provider directly; this class exists only on
 * the backend and is reached solely through `AiTeacherOrchestratorService`
 * (P8-062) → `ProviderGatewayTimeoutPolicyService` (P8-057), never called
 * directly by a controller.
 *
 * Maps the internal `AiProviderRequest` to the provider's request shape
 * (`ProviderRequestMapperService`, P8-055), attaches the API key only as
 * an out-of-band `Authorization` header (never in the request body, never
 * logged), and maps the raw provider response back to the internal
 * `AiProviderResponse` contract (`ProviderResponseMapperService`,
 * P8-056). Computes no mastery/level/weakness/difficulty/recommendation/
 * review-schedule value (docs/phase-8/no-aim-replacement-rule.md).
 */
import { Injectable } from '@nestjs/common';

import { AiProviderGateway } from './ai-provider-gateway.interface';
import { AiProviderRequest, AiProviderResponse } from './provider-gateway.types';
import { ProviderGatewayConfigService } from './provider-gateway.config';
import { ProviderRequestMapperService } from './provider-request.mapper';
import { ProviderResponseMapperService } from './provider-response.mapper';
import { ProviderCompletionResponse } from './provider-response-mapper.types';
import { AI_PROVIDER_COMPLETIONS_URL, AI_PROVIDER_NAME } from './provider-gateway-http-client.constants';

const NETWORK_ERROR_CATEGORY = 'PROVIDER_NETWORK_ERROR';
const HTTP_ERROR_CATEGORY = 'PROVIDER_HTTP_ERROR';

@Injectable()
export class ProviderGatewayHttpClientService extends AiProviderGateway {
  constructor(
    private readonly providerGatewayConfig: ProviderGatewayConfigService,
    private readonly requestMapper: ProviderRequestMapperService,
    private readonly responseMapper: ProviderResponseMapperService,
  ) {
    super();
  }

  async complete(request: AiProviderRequest): Promise<AiProviderResponse> {
    const { apiKey, model } = this.providerGatewayConfig.getConfig();
    const completionRequest = this.requestMapper.mapRequest(request);
    const start = Date.now();

    try {
      const response = await fetch(AI_PROVIDER_COMPLETIONS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(completionRequest),
      });

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        return this.responseMapper.mapResponse({
          provider: AI_PROVIDER_NAME,
          model,
          latencyMs,
          raw: null,
          errorCategory: HTTP_ERROR_CATEGORY,
        });
      }

      const raw = (await response.json()) as ProviderCompletionResponse;

      return this.responseMapper.mapResponse({
        provider: AI_PROVIDER_NAME,
        model,
        latencyMs,
        raw,
      });
    } catch {
      return this.responseMapper.mapResponse({
        provider: AI_PROVIDER_NAME,
        model,
        latencyMs: Date.now() - start,
        raw: null,
        errorCategory: NETWORK_ERROR_CATEGORY,
      });
    }
  }
}
