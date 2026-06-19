/**
 * P9-058: TTS Provider Interface (Group G — Text-to-Speech Pipeline).
 * Backend-only abstraction over whichever third-party TTS provider
 * synthesizes the AI Teacher's filtered reply text into audio, mirroring
 * the STT gateway types in stt-gateway/stt-gateway.types.ts.
 * Output shape matches docs/phase-9/tts-output-contract.md exactly: no
 * provider metadata, no learning-decision field, and no raw audio
 * payload or provider URL ever crosses this boundary.
 */

export interface TtsProviderRequest {
  readonly text: string;
  readonly languageCode: string;
}

export type TtsProviderResponseStatus = 'success' | 'error' | 'timeout';

export interface TtsProviderResponse {
  readonly status: TtsProviderResponseStatus;
  readonly audioRef: string | null;
  readonly durationMs: number | null;
  readonly contentType: string | null;
  readonly errorCategory?: string | null;
}
