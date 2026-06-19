/**
 * P8-062: Build AI Teacher Orchestrator (Group G — AI Teacher Backend
 * Pipeline). Input/output contract for a single AI Teacher chat turn.
 * `ChatTurnInput.contextRef` and `studentId`/`sessionId` are backend-
 * resolved by the caller, never accepted as a trusted learning-decision
 * value from the client. `ChatTurnResult` carries only the AI Teacher's
 * reply text and provider operational metadata — never a mastery/level/
 * weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
export interface ChatTurnInput {
  readonly studentId: string;
  readonly sessionId: string;
  readonly contextRef: string;
  readonly studentMessage: string;
}

export interface ChatTurnResult {
  readonly text: string;
  readonly isFallback: boolean;
  readonly provider: string;
  readonly model: string;
  readonly latencyMs: number;
}
