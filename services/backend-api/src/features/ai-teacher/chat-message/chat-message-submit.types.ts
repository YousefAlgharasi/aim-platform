/**
 * P8-064: Build Student Message Submit Service (Group G — AI Teacher
 * Backend Pipeline). Input/output contract for submitting a student's
 * chat message and starting the AI Teacher response pipeline.
 * `studentId`, `sessionId`, and `contextRef` must already be resolved by
 * the caller (e.g. from the authenticated JWT and an existing session,
 * in a later API task); this service never validates ownership itself,
 * only that the inputs it is given are present. Computes no mastery/
 * level/weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
export interface SubmitStudentMessageInput {
  readonly studentId: string;
  readonly sessionId: string;
  readonly contextRef: string;
  readonly studentMessage: string;
}

export interface SubmitStudentMessageResult {
  readonly text: string;
  readonly isFallback: boolean;
  readonly provider: string;
  readonly model: string;
  readonly latencyMs: number;
}
