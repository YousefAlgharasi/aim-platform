/**
 * P9-061: Create TTS Response Mapper.
 * Converts a raw, provider-specific `TtsCompletionResponse` (or an
 * already-known error category, e.g. from an HTTP client catch block)
 * into the internal `TtsProviderResponse` contract (Group G) consumed by
 * later TTS Gateway tasks. This mapper performs no database access,
 * no TTS provider call, and computes no mastery/level/weakness/
 * difficulty/recommendation/review-schedule value
 * (docs/phase-9/no-aim-authority-change-rule.md).
 *
 * Per docs/phase-9/tts-output-contract.md's Predictability Rules, a
 * missing raw response or an explicit error category yields an error
 * status. A successful response must include a non-null audioRef.
 */
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
