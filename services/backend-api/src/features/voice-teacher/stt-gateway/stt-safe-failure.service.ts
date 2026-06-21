/**
 * P9-045: Add STT Safe Failure Handling (Group E — Speech-to-Text
 * Pipeline). Implements the "STT provider failure" policy in
 * docs/phase-9/voice-error-policy.md: any non-success
 * `SttProviderResponse` (error, timeout — including a P9-043
 * low-confidence downgrade) is converted into a single, fixed,
 * student-safe fallback message. Internal detail — provider error text,
 * status codes, response bodies, error categories, confidence scores —
 * is never exposed to the client; this service only ever returns the
 * fixed fallback message or the gateway's own already-successful
 * transcript, unchanged.
 *
 * A successful response with an empty transcript is left unchanged and
 * is not treated as a failure here, per the empty/silent-recording rule
 * in docs/phase-9/stt-output-contract.md — that case is for Voice
 * Session Orchestration, not this service, to decide.
 *
 * This service never computes or substitutes a mastery/level/weakness/
 * difficulty/recommendation/review-schedule value on failure — an STT
 * failure is a hard stop on the transcript only, never a reason to
 * invent a learning-decision value
 * (docs/phase-9/no-aim-authority-change-rule.md).
 */
import { Injectable } from '@nestjs/common';

import { SttProviderResponse } from './stt-gateway.types';
import { STT_SAFE_FALLBACK_MESSAGE } from './stt-safe-failure.constants';

export interface SafeSttOutcome {
  readonly transcript: string | null;
  readonly message: string | null;
  readonly isFallback: boolean;
}

@Injectable()
export class SttSafeFailureService {
  toSafeOutcome(response: SttProviderResponse): SafeSttOutcome {
    if (response.status === 'success') {
      return { transcript: response.transcript, message: null, isFallback: false };
    }

    return { transcript: null, message: STT_SAFE_FALLBACK_MESSAGE, isFallback: true };
  }
}
