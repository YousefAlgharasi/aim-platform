import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../../database/database.module';
import { VoiceAudioAssetRepository } from './voice-audio-asset.repository';
import { VoiceFeedbackRepository } from './voice-feedback.repository';
import { VoiceMessageRepository } from './voice-message.repository';
import { VoiceProviderLogRepository } from './voice-provider-log.repository';
import { VoiceSafetyEventRepository } from './voice-safety-event.repository';
import { VoiceSessionRepository } from './voice-session.repository';
import { VoiceTranscriptRepository } from './voice-transcript.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    VoiceSessionRepository,
    VoiceMessageRepository,
    VoiceAudioAssetRepository,
    VoiceTranscriptRepository,
    VoiceProviderLogRepository,
    VoiceSafetyEventRepository,
    VoiceFeedbackRepository,
  ],
  exports: [
    VoiceSessionRepository,
    VoiceMessageRepository,
    VoiceAudioAssetRepository,
    VoiceTranscriptRepository,
    VoiceProviderLogRepository,
    VoiceSafetyEventRepository,
    VoiceFeedbackRepository,
  ],
})
export class VoiceRepositoriesModule {}
