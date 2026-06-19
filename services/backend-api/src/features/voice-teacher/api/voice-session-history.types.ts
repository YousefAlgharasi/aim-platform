export interface VoiceMessageDto {
  readonly id: string;
  readonly role: 'student' | 'teacher';
  readonly text: string;
  readonly audioRef: string | null;
  readonly createdAt: string;
}

export interface VoiceSessionHistoryResponse {
  readonly sessionId: string;
  readonly messages: readonly VoiceMessageDto[];
}
