export interface VoiceMessageDto {
  readonly id: string;
  readonly role: 'student' | 'teacher';
  readonly text: string;
  readonly audioRef: string | null;
  readonly createdAt: string;
  /**
   * P21-006/P21-015: unified text+voice conversation turn fields, read from
   * the same ai_chat_messages history the AI Teacher chat screen uses
   * (apps/mobile's VoiceMessageModel already parses these).
   */
  readonly channel: 'text' | 'voice';
  readonly audioDurationMs: number | null;
  readonly isGreeting: boolean;
}

export interface VoiceSessionHistoryResponse {
  readonly sessionId: string;
  readonly messages: readonly VoiceMessageDto[];
}
