import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TTS_GATEWAY } from './tts-gateway.interface';
import { TtsGatewayConfigService } from './tts-gateway.config';
import { TtsRequestMapperService } from './tts-request.mapper';
import { TtsResponseMapperService } from './tts-response.mapper';
import { TtsSafeFailureService } from './tts-safe-failure.service';
import { TtsAudioStorageService } from './tts-audio-storage.service';
import { TtsAudioGenerationService } from './tts-audio-generation.service';

@Module({
  imports: [ConfigModule],
  providers: [
    TtsGatewayConfigService,
    TtsRequestMapperService,
    TtsResponseMapperService,
    TtsSafeFailureService,
    TtsAudioStorageService,
    TtsAudioGenerationService,
    { provide: TTS_GATEWAY, useExisting: TtsAudioGenerationService },
  ],
  exports: [TTS_GATEWAY, TtsSafeFailureService, TtsAudioStorageService],
})
export class TtsGatewayModule {}
