/**
 * P8-053: AI Provider Interface — module skeleton.
 * Exposes the `AiProviderGateway` abstraction (token: `AI_PROVIDER_GATEWAY`)
 * for callers to depend on. No concrete provider binding exists yet —
 * that wiring (HTTP client, request/response mapping, timeout, logging,
 * safe-failure handling) is added by later Group F tasks
 * (P8-054..P8-060) by providing a concrete class for this token here.
 */
import { Module } from '@nestjs/common';

@Module({})
export class ProviderGatewayModule {}
