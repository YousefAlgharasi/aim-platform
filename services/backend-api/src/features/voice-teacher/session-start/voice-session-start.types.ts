/**
 * P9-049: Build Voice Session Start Service (Group F — Voice Orchestration
 * With Phase 8 AI Teacher). Input/output contract for starting a new,
 * student-owned Voice Mode session, mirroring StartChatSessionInput/Result
 * (P8-063). `studentId` must already be resolved by the caller from the
 * authenticated session (never accepted as a trusted client-supplied
 * value) and `contextRef` identifies the lesson/skill context the session
 * is scoped to. Computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value
 * (docs/phase-9/no-aim-authority-change-rule.md).
 */
export interface StartVoiceSessionInput {
  readonly studentId: string;
  readonly contextRef: string;
}

export interface StartVoiceSessionResult {
  readonly sessionId: string;
  readonly studentId: string;
  readonly contextRef: string;
  readonly status: 'active' | 'ended';
  readonly createdAt: string;
}

/** Row shape for voice_sessions (P9-018 migration). */
export interface VoiceSessionRow {
  readonly id: string;
  readonly student_id: string;
  readonly context_ref: string;
  readonly status: 'active' | 'ended';
  readonly created_at: string;
  readonly updated_at: string;
}
