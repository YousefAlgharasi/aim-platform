/**
 * P9-054: Persist Voice Conversation Messages — module wiring. Wires the
 * existing `VoiceRepositoriesModule` (P9-027) behind
 * `VoiceMessagePersistenceService`. Not yet wired into the top-level
 * `VoiceTeacherModule` since no controller/API route exists to invoke it
 * directly — that integration is a separate, later task.
 */
import { Module } from '@nestjs/common';

import { VoiceRepositoriesModule } from '../repositories/voice-repositories.module';
import { VoiceMessagePersistenceService } from './voice-message-persistence.service';

@Module({
  imports: [VoiceRepositoriesModule],
  providers: [VoiceMessagePersistenceService],
  exports: [VoiceMessagePersistenceService],
})
export class VoiceMessagePersistenceModule {}
