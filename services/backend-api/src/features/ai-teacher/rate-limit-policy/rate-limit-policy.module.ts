/**
 * P8-069: Add AI Teacher Rate Limit Policy — module.
 * Exports `RateLimitPolicyService` for use by the AI Teacher orchestrator
 * (P8-062) and any future API layer that needs to enforce rate limits.
 * Imports `AiChatRepositoriesModule` to obtain `AiChatMessageRepository`,
 * which provides the DB count queries used by the policy checks.
 */
import { Module } from '@nestjs/common';

import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { RateLimitPolicyService } from './rate-limit-policy.service';

@Module({
  imports: [AiChatRepositoriesModule],
  providers: [RateLimitPolicyService],
  exports: [RateLimitPolicyService],
})
export class RateLimitPolicyModule {}
