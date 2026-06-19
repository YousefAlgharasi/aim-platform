/**
 * P9-038: STT Provider Interface — abstract gateway contract.
 * Callers depend on this abstract class (used as a NestJS injection
 * token) and the `STT_GATEWAY` token below, never on a concrete STT
 * provider implementation. A concrete implementation (request mapping,
 * response mapping, language/confidence policy, timeout policy, safe
 * failure handling) is provided by later Group E tasks (P9-039..P9-046)
 * and bound to this token in a future stt-gateway module.
 *
 * `transcribe` never computes or returns a mastery/level/weakness/
 * difficulty/recommendation/review-schedule value (its return type,
 * `SttProviderResponse`, carries only the transcript and operational
 * metadata, per docs/phase-9/no-aim-authority-change-rule.md), and it
 * never echoes back the input audio (per docs/phase-9/stt-output-contract.md).
 */
import { SttProviderRequest, SttProviderResponse } from './stt-gateway.types';

export const STT_GATEWAY = Symbol('STT_GATEWAY');

export abstract class SttGateway {
  abstract transcribe(request: SttProviderRequest): Promise<SttProviderResponse>;
}
