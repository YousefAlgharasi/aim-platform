/**
 * P8-059: Add AI Provider Logging (Group F — AI Provider Gateway).
 * Persists safe, non-sensitive operational metadata for each AI Teacher
 * provider call attempt via `AiProviderLogRepository` (P8-026,
 * ai_provider_logs table from P8-021). Logs only provider, model,
 * status, error category, and latency — never the prompt text, the raw
 * provider response body, or any provider credential
 * (docs/phase-8/privacy-policy.md). This service never computes or
 * alters a mastery/level/weakness/difficulty/recommendation/review-
 * schedule value (docs/phase-8/no-aim-replacement-rule.md).
 */
import { Injectable, Logger } from '@nestjs/common';

import { AiProviderLogRepository } from '../repositories/ai-provider-log.repository';
import { AiProviderResponse } from './provider-gateway.types';

@Injectable()
export class ProviderGatewayLoggingService {
  private readonly logger = new Logger(ProviderGatewayLoggingService.name);

  constructor(private readonly providerLogRepository: AiProviderLogRepository) {}

  async logAttempt(sessionId: string, response: AiProviderResponse): Promise<void> {
    try {
      await this.providerLogRepository.create({
        sessionId,
        provider: response.provider,
        model: response.model,
        status: response.status,
        errorCategory: response.errorCategory ?? null,
        latencyMs: response.latencyMs,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to persist AI provider log for session ${sessionId}: ${(error as Error).message}`,
      );
    }
  }
}
