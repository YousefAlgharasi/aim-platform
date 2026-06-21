/**
 * P9-058: TTS Provider Interface — abstract gateway contract.
 * Callers depend on this abstract class (used as a NestJS injection
 * token) and the `TTS_GATEWAY` token below, never on a concrete TTS
 * provider implementation. A concrete implementation (request mapping,
 * response mapping, voice selection, safe failure handling) is provided
 * by later Group G tasks (P9-059..P9-066) and bound to this token in
 * a future tts-gateway module.
 *
 * `synthesize` never computes or returns a mastery/level/weakness/
 * difficulty/recommendation/review-schedule value (its return type,
 * `TtsProviderResponse`, carries only the audio reference and operational
 * metadata, per docs/phase-9/no-aim-authority-change-rule.md), and it
 * never echoes back the input text or any provider-specific detail
 * (per docs/phase-9/tts-output-contract.md).
 */
import { TtsProviderRequest, TtsProviderResponse } from './tts-gateway.types';

export const TTS_GATEWAY = Symbol('TTS_GATEWAY');

export abstract class TtsGateway {
  abstract synthesize(request: TtsProviderRequest): Promise<TtsProviderResponse>;
}
