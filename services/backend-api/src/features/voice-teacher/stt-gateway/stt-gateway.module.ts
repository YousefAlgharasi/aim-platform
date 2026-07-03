import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { STT_GATEWAY } from './stt-gateway.interface';
import { SttGatewayConfigService } from './stt-gateway.config';
import { SttRequestMapperService } from './stt-request.mapper';
import { SttResponseMapperService } from './stt-response.mapper';
import { SttConfidencePolicyService } from './stt-confidence-policy.service';
import { SttSafeFailureService } from './stt-safe-failure.service';
import { SttTranscriptionService } from './stt-transcription.service';

@Module({
  imports: [ConfigModule],
  providers: [
    SttGatewayConfigService,
    SttRequestMapperService,
    SttResponseMapperService,
    SttConfidencePolicyService,
    SttSafeFailureService,
    SttTranscriptionService,
    { provide: STT_GATEWAY, useExisting: SttTranscriptionService },
  ],
  exports: [STT_GATEWAY, SttSafeFailureService],
})
export class SttGatewayModule {}
