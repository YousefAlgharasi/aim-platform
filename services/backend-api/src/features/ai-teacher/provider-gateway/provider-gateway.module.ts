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
 * P8-059: Imports `AiChatRepositoriesModule` and provides
 * `ProviderGatewayLoggingService`, which persists safe provider-call
 * metadata via `AiProviderLogRepository` (P8-026/P8-021).
 */
import { Module } from '@nestjs/common';

import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { ProviderGatewayConfigService } from './provider-gateway.config';
import { ProviderGatewayLoggingService } from './provider-gateway-logging.service';

@Module({
  imports: [AiChatRepositoriesModule],
  providers: [ProviderGatewayConfigService, ProviderGatewayLoggingService],
  exports: [ProviderGatewayConfigService, ProviderGatewayLoggingService],
})
export class ProviderGatewayModule {}
