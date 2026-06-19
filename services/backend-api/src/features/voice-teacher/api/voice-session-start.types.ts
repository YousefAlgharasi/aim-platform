export interface StartVoiceSessionRequestBody {
  readonly contextRef?: string;
}

export interface StartVoiceSessionResponse {
  readonly sessionId: string;
  readonly createdAt: string;
}
