export interface TtsCompletionRequest {
  readonly model: string;
  readonly text: string;
  readonly languageCode: string;
}
