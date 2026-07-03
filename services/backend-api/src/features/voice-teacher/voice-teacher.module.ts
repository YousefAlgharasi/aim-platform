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

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    VoiceSessionStartApiModule,
    VoiceRepositoriesModule,
    VoiceOrchestratorModule,
  ],
  controllers: [VoiceAudioSubmitController, VoiceAudioPlaybackController],
  providers: [VoiceTeacherService, SttTranscriptPersistenceService, VoiceSessionOwnershipGuard],
  exports: [VoiceTeacherService, SttTranscriptPersistenceService],
})
export class VoiceTeacherModule {}
