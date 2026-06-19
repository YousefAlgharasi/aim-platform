/**
 * P9-040: Create STT Request Mapper.
 * Converts an internal `SttProviderRequest` (Group E contract,
 * stt-gateway.types.ts) carrying validated audio (per
 * docs/phase-9/audio-upload-contract.md) into a provider-specific
 * `SttCompletionRequest`. This mapper performs no database access, no
 * STT provider call, and computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value; it only restates the audio in
 * the provider's expected shape (docs/phase-9/no-aim-authority-change-rule.md).
 * The model name is read from `SttGatewayConfigService`, never
 * hard-coded; the provider API key is never read or included here, since
 * the HTTP client (a later Group E task) attaches it out-of-band, never
 * inside the request body.
 */
import { Injectable } from '@nestjs/common';

import { SttGatewayConfigService } from './stt-gateway.config';
import { SttProviderRequest } from './stt-gateway.types';
import { SttCompletionRequest } from './stt-request-mapper.types';

@Injectable()
export class SttRequestMapperService {
  constructor(private readonly sttGatewayConfig: SttGatewayConfigService) {}

  mapRequest(request: SttProviderRequest): SttCompletionRequest {
    const { model } = this.sttGatewayConfig.getConfig();
    const { audio, contentType } = request;

    return { model, audio, contentType };
  }
}
