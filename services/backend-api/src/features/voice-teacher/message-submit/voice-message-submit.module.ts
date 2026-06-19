/**
 * P9-050: Build Voice Message Submit Service — module wiring. Wires the
 * Audio Upload service (P9-028), the Voice Orchestrator (P9-048), and the
 * voice repositories (P9-027) together behind `VoiceMessageSubmitService`.
 *
 * P9-032: Persist Audio Metadata — imports AudioStorageModule so the
 * AUDIO_STORAGE_ADAPTER token is available to AudioMetadataPersistenceService,
 * and adds AudioMetadataPersistenceService to providers so AudioUploadService
 * can inject it.
 *
 * Not yet wired into the top-level `VoiceTeacherModule` since no
 * controller/API route exists to invoke it — that integration is a
 * separate, later task (P9-068+).
 */
import { Module } from '@nestjs/common';

import { AiTeacherOrchestratorModule } from '../../ai-teacher/orchestrator/ai-teacher-orchestrator.module';
import { AudioStorageModule } from '../audio-storage/audio-storage.module';
import { AudioMetadataPersistenceService } from '../audio-upload/audio-metadata-persistence.service';
import { AudioUploadService } from '../audio-upload/audio-upload.service';
import { VoiceOrchestratorService } from '../orchestrator/voice-orchestrator.service';
import { VoiceRepositoriesModule } from '../repositories/voice-repositories.module';
import { SttSafeFailureService } from '../stt-gateway/stt-safe-failure.service';
import { VoiceMessageSubmitService } from './voice-message-submit.service';

@Module({
  imports: [VoiceRepositoriesModule, AiTeacherOrchestratorModule, AudioStorageModule],
  providers: [
    AudioMetadataPersistenceService,
    AudioUploadService,
    VoiceOrchestratorService,
    SttSafeFailureService,
    VoiceMessageSubmitService,
  ],
  exports: [VoiceMessageSubmitService],
})
export class VoiceMessageSubmitModule {}
