/**
 * P9-052: Link Voice Session With AI Teacher Context — module wiring.
 * Wires the existing `VoiceRepositoriesModule` (P9-027) behind
 * `VoiceSessionContextLinkService`. Not yet wired into the top-level
 * `VoiceTeacherModule` since no controller/API route exists to invoke it
 * directly — that integration is a separate, later task.
 */
import { Module } from '@nestjs/common';

import { VoiceRepositoriesModule } from '../repositories/voice-repositories.module';
import { VoiceSessionContextLinkService } from './voice-session-context-link.service';

@Module({
  imports: [VoiceRepositoriesModule],
  providers: [VoiceSessionContextLinkService],
  exports: [VoiceSessionContextLinkService],
})
export class VoiceSessionContextLinkModule {}
