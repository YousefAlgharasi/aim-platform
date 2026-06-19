export interface VoiceSessionSummaryDto {
  readonly sessionId: string;
  readonly createdAt: string;
  readonly lastActivityAt: string | null;
  readonly messageCount: number;
}

export interface VoiceSessionListResponse {
  readonly sessions: readonly VoiceSessionSummaryDto[];
}
