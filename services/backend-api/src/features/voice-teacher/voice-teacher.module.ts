import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { VoiceTeacherService } from './voice-teacher.service';
import { SttTranscriptPersistenceService } from './stt-gateway/stt-transcript-persistence.service';
import { VoiceSessionStartApiModule } from './session-start-api/voice-session-start-api.module';
import { VoiceRepositoriesModule } from './repositories/voice-repositories.module';
import { VoiceOrchestratorModule } from './orchestrator/voice-orchestrator.module';
import { VoiceSessionOwnershipGuard } from './api/guards/voice-session-ownership.guard';
import { VoiceAudioSubmitController } from './api/voice-audio-submit.controller';
import { VoiceAudioPlaybackController } from './api/voice-audio-playback.controller';
import { AiChatRepositoriesModule } from '../ai-teacher/repositories/ai-chat-repositories.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    VoiceSessionStartApiModule,
    VoiceRepositoriesModule,
    VoiceOrchestratorModule,
    // P21-007/P21-010: AiChatSessionRepository, for session ownership checks
    // and contextRef lookups now that voice sessions live in ai_chat_sessions.
    AiChatRepositoriesModule,
  ],
  controllers: [VoiceAudioSubmitController, VoiceAudioPlaybackController],
  providers: [VoiceTeacherService, SttTranscriptPersistenceService, VoiceSessionOwnershipGuard],
  exports: [VoiceTeacherService, SttTranscriptPersistenceService],
})
export class VoiceTeacherModule {}
