import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { AiChatRepositoriesModule } from '../../ai-teacher/repositories/ai-chat-repositories.module';
import { TtsGatewayModule } from '../tts-gateway/tts-gateway.module';
import { VoiceMessageAudioController } from './voice-message-audio.controller';
import { VoiceMessageAudioService } from './voice-message-audio.service';

@Module({
  imports: [AuthModule, AiChatRepositoriesModule, TtsGatewayModule],
  controllers: [VoiceMessageAudioController],
  providers: [VoiceMessageAudioService],
  exports: [VoiceMessageAudioService],
})
export class VoiceMessageAudioModule {}
