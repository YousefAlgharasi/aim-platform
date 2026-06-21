/**
 * P8-053: AI Provider Interface (Group F — AI Provider Gateway).
 * Backend-only abstraction over whichever third-party AI provider serves
 * AI Teacher completions. Business logic (Prompt Builder, Group E; AI
 * Teacher Backend Pipeline, Group G) depends only on `AiProviderGateway`
 * below, never on a concrete provider SDK, so the provider can be
 * swapped, mocked, or load-balanced without touching callers
 * (docs/phase-8/no-client-ai-provider-rule.md — this gateway is the only
 * backend-internal seam that may ever call an external AI provider;
 * Flutter never has network access to a provider directly).
 */
import { AiTeacherPrompt } from '../prompt-builder/prompt-builder.types';

export interface AiProviderRequest {
  readonly sessionId: string;
  readonly prompt: AiTeacherPrompt;
}

export type AiProviderResponseStatus = 'success' | 'error' | 'timeout';

export interface AiProviderResponse {
  readonly status: AiProviderResponseStatus;
  readonly text: string | null;
  readonly provider: string;
  readonly model: string;
  readonly latencyMs: number;
  readonly errorCategory?: string | null;
}
