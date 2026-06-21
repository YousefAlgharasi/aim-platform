/**
 * P9-052: Link Voice Session With AI Teacher Context (Group F — Voice
 * Orchestration With Phase 8 AI Teacher). Input/output contract for
 * resolving the Phase 8 AI Teacher `contextRef` a Voice Mode turn must use
 * from the backend-owned `voice_sessions` row, rather than from any
 * client-supplied value. No mastery/level/weakness/difficulty/
 * recommendation/review-schedule value crosses this boundary
 * (docs/phase-9/no-aim-authority-change-rule.md).
 */

export interface ResolveVoiceSessionContextInput {
  /** Backend-resolved student UUID from the JWT; never a client claim. */
  readonly studentId: string;

  /** Backend-resolved voice session UUID; ownership is validated here. */
  readonly sessionId: string;
}

export interface VoiceSessionContextLink {
  readonly sessionId: string;
  readonly studentId: string;

  /**
   * The Phase 8 AI Teacher `contextRef` this voice session is scoped to,
   * read directly from the `voice_sessions` row created at session start
   * (P9-049) — never accepted as a client-supplied value at turn time.
   */
  readonly contextRef: string;
}
