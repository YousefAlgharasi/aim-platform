/**
 * P8-058: Add AI Provider Safe Failure Handling (Group F — AI Provider
 * Gateway). Implements the "Provider failure" policy in
 * docs/phase-8/ai-teacher-error-policy.md: any non-success
 * `AiProviderResponse` (error, timeout, or a response whose text is
 * missing/malformed) is converted into a single, fixed, student-safe
 * fallback string. Internal detail — provider error text, status codes,
 * response bodies, stack traces — is never exposed to the client; this
 * service only ever returns the fixed fallback message or the
 * provider's own already-successful text, unchanged.
 *
 * This service never computes or substitutes a mastery/level/weakness/
 * difficulty/recommendation/review-schedule value on failure — a
 * provider failure is a hard stop on the AI Teacher reply only, never a
 * reason to invent a learning-decision value
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
import { Injectable } from '@nestjs/common';

import { AiProviderResponse } from './provider-gateway.types';
import { AI_PROVIDER_SAFE_FALLBACK_MESSAGE } from './provider-gateway-safe-failure.constants';

export interface SafeAiTeacherReply {
  readonly text: string;
  readonly isFallback: boolean;
}

@Injectable()
export class ProviderGatewaySafeFailureService {
  toSafeReply(response: AiProviderResponse): SafeAiTeacherReply {
    if (response.status === 'success' && this.hasUsableText(response.text)) {
      return { text: response.text as string, isFallback: false };
    }

    return { text: AI_PROVIDER_SAFE_FALLBACK_MESSAGE, isFallback: true };
  }

  private hasUsableText(text: string | null): boolean {
    return typeof text === 'string' && text.trim().length > 0;
  }
}
