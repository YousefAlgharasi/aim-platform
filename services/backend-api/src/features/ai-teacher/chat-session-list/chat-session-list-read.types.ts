/**
 * P8-074: Create Chat Session List API.
 * Input/output contract for listing the authenticated student's active
 * AI Teacher chat sessions. studentId is resolved by the caller from the
 * authenticated JWT; this service never accepts it as a trusted client
 * value. Computes no mastery/level/weakness/difficulty/recommendation/
 * review-schedule value (docs/phase-8/no-aim-replacement-rule.md).
 */
export interface ChatSessionListItem {
  readonly sessionId: string;
  readonly contextRef: string;
  readonly status: 'active' | 'closed';
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ListChatSessionsInput {
  readonly studentId: string;
}

export interface ListChatSessionsResult {
  readonly sessions: readonly ChatSessionListItem[];
}
