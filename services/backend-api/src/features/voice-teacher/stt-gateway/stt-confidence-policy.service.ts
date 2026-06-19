/**
 * P9-043: Add STT Confidence Policy.
 * Applies a low-confidence check to an already-mapped `SttProviderResponse`
 * (produced by `SttResponseMapperService`, P9-041) using a raw,
 * provider-specific confidence score. The raw confidence value is
 * provider-internal input only — it is never read from, added to, or
 * returned in `SttProviderResponse` (per the excluded-fields table in
 * docs/phase-9/stt-output-contract.md, which keeps per-provider
 * confidence metadata out of the contract). This service performs no
 * database access, no provider call, and computes no mastery/level/
 * weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-9/no-aim-authority-change-rule.md); a low-confidence
 * transcript is downgraded to the same `error` shape as any other STT
 * provider failure (docs/phase-9/voice-error-policy.md's "STT provider
 * failure" category), never silently passed through as real speech.
 */
import { Injectable } from '@nestjs/common';

import {
  STT_LOW_CONFIDENCE_ERROR_CATEGORY,
  STT_LOW_CONFIDENCE_THRESHOLD,
} from './stt-confidence-policy.constants';
import { SttProviderResponse } from './stt-gateway.types';

@Injectable()
export class SttConfidencePolicyService {
  apply(response: SttProviderResponse, rawConfidence: number | null): SttProviderResponse {
    if (response.status !== 'success') {
      return response;
    }

    if (rawConfidence === null) {
      return response;
    }

    if (rawConfidence >= STT_LOW_CONFIDENCE_THRESHOLD) {
      return response;
    }

    return {
      status: 'error',
      transcript: null,
      durationMs: null,
      errorCategory: STT_LOW_CONFIDENCE_ERROR_CATEGORY,
    };
  }
}
