import { Injectable } from '@nestjs/common';

import { TtsProviderResponse } from './tts-gateway.types';
import { TtsResponseMapperInput } from './tts-response-mapper.types';

const MISSING_RESPONSE_ERROR_CATEGORY = 'TTS_PROVIDER_CALL_FAILED';

@Injectable()
export class TtsResponseMapperService {
  mapResponse(input: TtsResponseMapperInput): TtsProviderResponse {
    if (input.errorCategory) {
      return {
        status: 'error',
        audioRef: null,
        durationMs: null,
        contentType: null,
        errorCategory: input.errorCategory,
      };
    }

    if (!input.raw || typeof input.raw.audioRef !== 'string') {
      return {
        status: 'error',
        audioRef: null,
        durationMs: null,
        contentType: null,
        errorCategory: MISSING_RESPONSE_ERROR_CATEGORY,
      };
    }

    return {
      status: 'success',
      audioRef: input.raw.audioRef,
      durationMs: input.raw.durationMs ?? null,
      contentType: input.raw.contentType ?? null,
    };
  }
}
