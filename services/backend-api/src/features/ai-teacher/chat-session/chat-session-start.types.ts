/**
 * P8-063: Build Chat Session Start Service (Group G — AI Teacher Backend
 * Pipeline). Input/output contract for starting a new, student-owned AI
 * Teacher chat session. `studentId` must already be resolved by the
 * caller from the authenticated session (never accepted as a trusted
 * client-supplied value) and `contextRef` identifies the lesson/skill
 * context the session is scoped to. Computes no mastery/level/weakness/
 * difficulty/recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
export interface StartChatSessionInput {
  readonly studentId: string;
  readonly contextRef: string;
}

export interface StartChatSessionResult {
  readonly sessionId: string;
  readonly studentId: string;
  readonly contextRef: string;
  readonly status: 'active' | 'closed';
  readonly createdAt: string;
}
