/**
 * P8-073: Create Chat History API.
 * Input/output contract for reading the persisted message history of an
 * AI Teacher chat session. studentId is resolved by the caller from the
 * authenticated JWT and is used only to verify session ownership; this
 * service never validates ownership itself, only that the inputs it is
 * given are present. Computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
export interface ChatHistoryMessage {
  readonly id: string;
  readonly role: 'student' | 'ai_teacher';
  readonly text: string;
  readonly createdAt: string;
  // P21-006/P21-015: unified text+voice conversation turn fields, so both
  // the chat screen and the voice screen can render one shared message
  // shape from the same ai_chat_messages history.
  readonly channel: 'text' | 'voice';
  readonly audioRef: string | null;
  readonly audioDurationMs: number | null;
  readonly isGreeting: boolean;
}

export interface GetChatHistoryInput {
  readonly studentId: string;
  readonly sessionId: string;
}

export interface GetChatHistoryResult {
  readonly sessionId: string;
  readonly messages: readonly ChatHistoryMessage[];
  /**
   * P21-012: short "today we're focusing on" recap line, distinct from any
   * message's prose. Null when no active focus directive exists.
   */
  readonly focusRecap: string | null;
}
