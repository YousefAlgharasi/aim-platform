/**
 * P8-053: AI Provider Interface — abstract gateway contract.
 * Callers depend on this abstract class (used as a NestJS injection
 * token) and the `AI_PROVIDER_GATEWAY` token below, never on a concrete
 * provider implementation. A concrete implementation (request mapping,
 * response mapping, timeout policy, logging, safe-failure handling) is
 * provided by later Group F tasks (P8-054..P8-060) and bound to this
 * token in `provider-gateway.module.ts`.
 *
 * `complete` never computes or returns a mastery/level/weakness/
 * difficulty/recommendation/review-schedule value — its return type
 * (`AiProviderResponse`) carries only provider-response text and
 * operational metadata (docs/phase-8/no-aim-replacement-rule.md).
 */
import { AiProviderRequest, AiProviderResponse } from './provider-gateway.types';

export const AI_PROVIDER_GATEWAY = Symbol('AI_PROVIDER_GATEWAY');

export abstract class AiProviderGateway {
  abstract complete(request: AiProviderRequest): Promise<AiProviderResponse>;
}
