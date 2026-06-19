/**
 * P9-038: STT Provider Interface (Group E — Speech-to-Text Pipeline).
 * Backend-only abstraction over whichever third-party STT provider
 * transcribes a student's recorded audio, mirroring
 * services/backend-api/src/features/ai-teacher/provider-gateway/provider-gateway.types.ts.
 * Output shape matches docs/phase-9/stt-output-contract.md exactly: no
 * provider metadata, no confidence score, no learning-decision field, and
 * no raw audio payload ever crosses this boundary.
 */
export interface SttProviderRequest {
  readonly audio: Buffer;
  readonly contentType: string;
}

export type SttProviderResponseStatus = 'success' | 'error' | 'timeout';

export interface SttProviderResponse {
  readonly status: SttProviderResponseStatus;
  readonly transcript: string | null;
  readonly durationMs: number | null;
  readonly errorCategory?: string | null;
}
