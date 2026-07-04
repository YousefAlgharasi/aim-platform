import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { UsersModule } from '../../users';
import { AiChatRepositoriesModule } from '../../ai-teacher/repositories/ai-chat-repositories.module';
import { TtsGatewayModule } from '../tts-gateway/tts-gateway.module';
import { VoiceMessageAudioController } from './voice-message-audio.controller';
import { VoiceMessageAudioService } from './voice-message-audio.service';

@Module({
  // UsersModule must be imported directly (not just transitively via
  // AuthModule) — ResolveInternalUserIdGuard's own UsersService dependency
  // only resolves when the enclosing module imports UsersModule itself,
  // same pattern as ChatHistoryReadModule/VoiceSessionStartApiModule.
  imports: [AuthModule, UsersModule, AiChatRepositoriesModule, TtsGatewayModule],
  controllers: [VoiceMessageAudioController],
  providers: [VoiceMessageAudioService],
  exports: [VoiceMessageAudioService],
})
export class VoiceMessageAudioModule {}
