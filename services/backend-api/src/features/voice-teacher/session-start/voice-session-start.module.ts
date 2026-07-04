/**
 * P9-049: Build Voice Session Start Service — module wiring.
 *
 * P21-007: `VoiceSessionStartService` no longer creates its own
 * `voice_sessions` row — it delegates to `ChatSessionStartService`
 * (get-or-create by (studentId, contextRef) against `ai_chat_sessions`).
 * `VoiceSessionRepository` is kept as a provider/export here since it may
 * still be read elsewhere for historical `voice_sessions` data (P21-021),
 * but this module no longer uses it to create sessions.
 */
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../../database/database.module';
import { ChatSessionStartModule } from '../../ai-teacher/chat-session/chat-session-start.module';
import { VoiceSessionRepository } from './voice-session.repository';
import { VoiceSessionStartService } from './voice-session-start.service';

@Module({
  imports: [DatabaseModule, ChatSessionStartModule],
  providers: [VoiceSessionRepository, VoiceSessionStartService],
  exports: [VoiceSessionStartService, VoiceSessionRepository],
})
export class VoiceSessionStartModule {}
