// P18-026: Create AI Provider Adapter Interface
// Capability-based provider abstraction for the AI Teacher governance
// pipeline. Callers depend on this interface only — never on a concrete
// provider SDK. Provider identity is resolved server-side from
// AiModelConfig.providerKeyRef (a non-secret reference string looked up in
// a secret manager); it is never client-supplied or hard-coded here.
//
// This sits alongside (and does not replace) the legacy chat-only
// AiProviderGateway (P8-053) used by the existing chat pipeline.

export const AI_TEACHER_PROVIDER_GATEWAY = Symbol('AI_TEACHER_PROVIDER_GATEWAY');

export interface AiTeacherTextGenerationRequest {
  readonly providerKeyRef: string;
  readonly modelId: string;
  readonly prompt: string;
  readonly parameters?: Record<string, unknown>;
}

export interface AiTeacherTextGenerationResponse {
  readonly text: string;
  readonly tokensUsed: number | null;
}

export interface AiTeacherSpeechToTextRequest {
  readonly providerKeyRef: string;
  readonly modelId: string;
  readonly audioRef: string;
}

export interface AiTeacherSpeechToTextResponse {
  readonly transcript: string;
  readonly durationSeconds: number | null;
}

export interface AiTeacherTextToSpeechRequest {
  readonly providerKeyRef: string;
  readonly modelId: string;
  readonly text: string;
}

export interface AiTeacherTextToSpeechResponse {
  readonly audioRef: string;
  readonly durationSeconds: number | null;
}

export interface AiTeacherModerationRequest {
  readonly providerKeyRef: string;
  readonly content: string;
}

export interface AiTeacherModerationResponse {
  readonly flagged: boolean;
  readonly categories: string[];
}

/**
 * Capability-based provider gateway. A concrete implementation resolves
 * `providerKeyRef` to an actual provider/secret and never exposes that
 * resolution to callers — they only ever see this interface.
 */
export abstract class AiTeacherProviderGateway {
  abstract generateText(
    request: AiTeacherTextGenerationRequest,
  ): Promise<AiTeacherTextGenerationResponse>;

  abstract transcribeSpeech(
    request: AiTeacherSpeechToTextRequest,
  ): Promise<AiTeacherSpeechToTextResponse>;

  abstract synthesizeSpeech(
    request: AiTeacherTextToSpeechRequest,
  ): Promise<AiTeacherTextToSpeechResponse>;

  abstract moderateContent(
    request: AiTeacherModerationRequest,
  ): Promise<AiTeacherModerationResponse>;
}
