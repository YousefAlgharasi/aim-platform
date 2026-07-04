/**
 * P9-055: Add Voice Rate Limit Policy — module.
 * Exports `VoiceRateLimitPolicyService` for use by the voice orchestration
 * pipeline (P9-048) and any future API layer that needs to enforce rate
 * limits.
 *
 * P21-021b: imports `AiChatRepositoriesModule` to obtain
 * `AiChatMessageRepository`, which now provides the voice-turn count
 * queries used by the policy checks (`voice_messages` stopped receiving
 * new writes in the same task, so counting there would have silently
 * disabled this limiter). Not yet wired into the top-level
 * `VoiceTeacherModule` since no controller/API route exists to invoke it
 * directly — that integration is a separate, later task.
 */
import { Module } from '@nestjs/common';

import { AiChatRepositoriesModule } from '../../ai-teacher/repositories/ai-chat-repositories.module';
import { VoiceRateLimitPolicyService } from './voice-rate-limit-policy.service';

@Module({
  imports: [AiChatRepositoriesModule],
  providers: [VoiceRateLimitPolicyService],
  exports: [VoiceRateLimitPolicyService],
})
export class VoiceRateLimitPolicyModule {}
