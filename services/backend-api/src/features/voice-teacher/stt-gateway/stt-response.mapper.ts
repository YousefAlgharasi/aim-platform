/**
 * P9-041: Create STT Response Mapper.
 * Converts a raw, provider-specific `SttCompletionResponse` (or an
 * already-known error category, e.g. from an HTTP client catch block)
 * into the internal `SttProviderResponse` contract (Group E) consumed by
 * later STT Gateway tasks (language policy P9-042, confidence policy
 * P9-043, safe failure P9-045). This mapper performs no database access,
 * no STT provider call, and computes no mastery/level/weakness/
 * difficulty/recommendation/review-schedule value
 * (docs/phase-9/no-aim-authority-change-rule.md).
 *
 * Per docs/phase-9/stt-output-contract.md's Predictability Rules, an
 * empty/silent recording resolving to an empty transcript is not treated
 * as a failure here — only a missing raw response or an explicit error
 * category is. Whether an empty transcript is usable is decided later by
 * Voice Session Orchestration, not this mapper.
 */
import { Injectable } from '@nestjs/common';

import { SttProviderResponse } from './stt-gateway.types';
import { SttResponseMapperInput } from './stt-response-mapper.types';

const MISSING_RESPONSE_ERROR_CATEGORY = 'STT_PROVIDER_CALL_FAILED';

@Injectable()
export class SttResponseMapperService {
  mapResponse(input: SttResponseMapperInput): SttProviderResponse {
    const { latencyMs } = input;

    if (input.errorCategory) {
      return {
        status: 'error',
        transcript: null,
        durationMs: null,
        errorCategory: input.errorCategory,
      };
    }

    if (!input.raw || typeof input.raw.text !== 'string') {
      return {
        status: 'error',
        transcript: null,
        durationMs: null,
        errorCategory: MISSING_RESPONSE_ERROR_CATEGORY,
      };
    }

    return {
      status: 'success',
      transcript: input.raw.text,
      durationMs: input.raw.durationMs ?? latencyMs,
    };
  }
}
