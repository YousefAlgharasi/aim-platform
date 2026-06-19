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
 */
import { Module } from '@nestjs/common';

import { ProviderGatewayConfigService } from './provider-gateway.config';

@Module({
  providers: [ProviderGatewayConfigService],
  exports: [ProviderGatewayConfigService],
})
export class ProviderGatewayModule {}
