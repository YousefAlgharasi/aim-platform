/**
 * P8-066: Add AI Response Safety Filter (Group G — AI Teacher Backend
 * Pipeline). Input/output contract for validating an AI Teacher response
 * before it is persisted or displayed to the student. Computes no
 * mastery/level/weakness/difficulty/recommendation/review-schedule value
 * itself (docs/phase-8/no-aim-replacement-rule.md).
 */
export interface FilterAiResponseInput {
  readonly sessionId: string;
  readonly text: string;
}

export interface FilterAiResponseResult {
  readonly text: string;
  readonly wasFiltered: boolean;
  readonly reasonCategory: string | null;
}
