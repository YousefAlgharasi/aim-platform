/**
 * P9-055: Add Voice Rate Limit Policy — module.
 * Exports `VoiceRateLimitPolicyService` for use by the voice orchestration
 * pipeline (P9-048) and any future API layer that needs to enforce rate
 * limits. Imports `VoiceRepositoriesModule` to obtain
 * `VoiceMessageRepository`, which provides the DB count queries used by
 * the policy checks. Not yet wired into the top-level `VoiceTeacherModule`
 * since no controller/API route exists to invoke it directly — that
 * integration is a separate, later task.
 */
import { Module } from '@nestjs/common';

import { VoiceRepositoriesModule } from '../repositories/voice-repositories.module';
import { VoiceRateLimitPolicyService } from './voice-rate-limit-policy.service';

@Module({
  imports: [VoiceRepositoriesModule],
  providers: [VoiceRateLimitPolicyService],
  exports: [VoiceRateLimitPolicyService],
})
export class VoiceRateLimitPolicyModule {}
