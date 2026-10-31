import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TTS_GATEWAY } from './tts-gateway.interface';
import { TtsGatewayConfigService } from './tts-gateway.config';
import { TtsRequestMapperService } from './tts-request.mapper';
import { TtsResponseMapperService } from './tts-response.mapper';
import { TtsSafeFailureService } from './tts-safe-failure.service';
import { TtsAudioStorageService } from './tts-audio-storage.service';
import { TtsAudioGenerationService } from './tts-audio-generation.service';
import { DatabaseModule } from '../../../database/database.module';
import { TtsAudioAssetRepository } from './persistent/tts-audio-asset.repository';
import { SupabaseAudioObjectStore } from './persistent/supabase-audio-object-store.service';
import { PersistentTtsAudioService } from './persistent/persistent-tts-audio.service';
import { AudioTranscoderService } from './persistent/audio-transcoder.service';
import { TtsAudioDeliveryService } from './persistent/tts-audio-delivery.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [
    TtsGatewayConfigService,
    TtsRequestMapperService,
    TtsResponseMapperService,
    TtsSafeFailureService,
    TtsAudioStorageService,
    TtsAudioGenerationService,
    TtsAudioAssetRepository,
    SupabaseAudioObjectStore,
    PersistentTtsAudioService,
    AudioTranscoderService,
    TtsAudioDeliveryService,
    { provide: TTS_GATEWAY, useExisting: TtsAudioGenerationService },
  ],
  exports: [
    TTS_GATEWAY,
    TtsSafeFailureService,
    TtsAudioStorageService,
    TtsAudioGenerationService,
    PersistentTtsAudioService,
    TtsAudioDeliveryService,
  ],
})
export class TtsGatewayModule {}
