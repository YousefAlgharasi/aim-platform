export interface VoiceAudioSubmitResponse {
  readonly text: string;
  readonly audioRef: string | null;
  readonly isFallback: boolean;
  readonly latencyMs: number;
}
