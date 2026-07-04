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
  /**
   * P21-012: short, separately-labelled "today we're focusing on" recap
   * line, derived from the student's active ai_focus_directives row. Null
   * when no active directive exists — never fabricated.
   */
  readonly focusRecap: string | null;
  /**
   * P21-013: short "welcome back" recap of real skill-state/weakness
   * progress, present only when a genuinely new session was just created
   * for a context the student has a prior *closed* session for, and that
   * prior session closed more than an hour ago (see
   * last-session-recap.service.ts for the full documented rule). Null on a
   * same-session resume and on a brand-new context with no prior history.
   */
  readonly lastSessionRecap: string | null;
}
