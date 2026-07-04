import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { VoiceTeacherService } from './voice-teacher.service';
import { SttTranscriptPersistenceService } from './stt-gateway/stt-transcript-persistence.service';
import { VoiceSessionStartApiModule } from './session-start-api/voice-session-start-api.module';
import { VoiceRepositoriesModule } from './repositories/voice-repositories.module';
import { VoiceOrchestratorModule } from './orchestrator/voice-orchestrator.module';
import { VoiceSessionOwnershipGuard } from './api/guards/voice-session-ownership.guard';
import { VoiceAudioSubmitController } from './api/voice-audio-submit.controller';
import { VoiceAudioPlaybackController } from './api/voice-audio-playback.controller';
import { VoiceSessionHistoryController } from './api/voice-session-history.controller';
import { AiChatRepositoriesModule } from '../ai-teacher/repositories/ai-chat-repositories.module';
import { ChatHistoryReadModule } from '../ai-teacher/chat-history/chat-history-read.module';
import { TtsGatewayModule } from './tts-gateway/tts-gateway.module';
import { VoiceMessageAudioModule } from './message-audio/voice-message-audio.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    VoiceSessionStartApiModule,
    VoiceRepositoriesModule,
    VoiceOrchestratorModule,
    // P21-007/P21-010: AiChatSessionRepository, for session ownership checks
    // and contextRef lookups now that voice sessions live in ai_chat_sessions.
    AiChatRepositoriesModule,
    // Bugfix: VoiceSessionHistoryController delegates to the same
    // ChatHistoryReadService the AI Teacher chat screen already uses,
    // rather than a second, never-implemented history reader.
    ChatHistoryReadModule,
    // P21-011: lazy on-demand TTS synthesis for text-originated turns.
    TtsGatewayModule,
    VoiceMessageAudioModule,
  ],
  controllers: [VoiceAudioSubmitController, VoiceAudioPlaybackController, VoiceSessionHistoryController],
  providers: [VoiceTeacherService, SttTranscriptPersistenceService, VoiceSessionOwnershipGuard],
  exports: [VoiceTeacherService, SttTranscriptPersistenceService],
})
export class VoiceTeacherModule {}
