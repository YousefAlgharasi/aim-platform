/**
 * P8-053: AI Provider Interface — module skeleton.
 * Exposes the `AiProviderGateway` abstraction (token: `AI_PROVIDER_GATEWAY`)
 * for callers to depend on. No concrete provider binding exists yet —
 * that wiring (HTTP client, request/response mapping, timeout, logging,
 * safe-failure handling) is added by later Group F tasks
 * (P8-054..P8-060) by providing a concrete class for this token here.
 *
 * P8-054: Provides `ProviderGatewayConfigService` so any concrete
 * provider implementation bound to `AI_PROVIDER_GATEWAY` reads provider
 * config (`AI_PROVIDER_API_KEY` / `AI_PROVIDER_MODEL`) through this
 * module rather than `process.env` directly. `BackendConfigModule` is
 * `@Global()`, so `BackendConfigService` does not need to be imported
 * here explicitly.
 *
 * P8-057: Provides `ProviderGatewayTimeoutPolicyService` for bounded
 * timeout/retry/backoff around a single provider call attempt.
 *
 * P8-058: Provides `ProviderGatewaySafeFailureService`, converting any
 * non-success provider response into the fixed, student-safe fallback
 * reply defined in docs/phase-8/ai-teacher-error-policy.md.
 *
 * P8-055: Also provides `ProviderRequestMapperService` so any concrete
 * provider implementation bound to `AI_PROVIDER_GATEWAY` maps an
 * `AiProviderRequest` into a provider-specific request through this
 * module rather than re-implementing mapping per provider.
 *
 * P8-056: Also provides `ProviderResponseMapperService` so any concrete
 * provider implementation maps a raw provider completion response back
 * into the internal `AiProviderResponse` contract through this module.
 */
import { Module } from '@nestjs/common';

import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { ProviderGatewayConfigService } from './provider-gateway.config';
import { ProviderGatewayTimeoutPolicyService } from './provider-gateway-timeout-policy.service';
import { ProviderGatewaySafeFailureService } from './provider-gateway-safe-failure.service';
import { ProviderRequestMapperService } from './provider-request.mapper';
import { ProviderResponseMapperService } from './provider-response.mapper';

@Module({
  providers: [
    ProviderGatewayConfigService,
    ProviderGatewayTimeoutPolicyService,
    ProviderGatewaySafeFailureService,
    ProviderRequestMapperService,
    ProviderResponseMapperService,
  ],
  exports: [
    ProviderGatewayConfigService,
    ProviderGatewayTimeoutPolicyService,
    ProviderGatewaySafeFailureService,
    ProviderRequestMapperService,
    ProviderResponseMapperService,
  ],
})
export class ProviderGatewayModule {}
