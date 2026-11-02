export type PracticeKind = 'speaking' | 'writing';

export interface PracticeTopicView {
  readonly id: string;
  readonly kind: PracticeKind;
  readonly title: string;
  readonly description: string | null;
  readonly levelCode: string | null;
  readonly xpReward: number;
  readonly timeLimitSeconds: number | null;
  readonly minWords: number | null;
}

export interface AdminPracticeTopicView {
  readonly id: string;
  readonly kind: PracticeKind;
  readonly levelCode: string | null;
  readonly xpReward: number;
  readonly timeLimitSeconds: number | null;
  readonly minWords: number | null;
  readonly aiPrompt: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly translations: Record<string, { title: string; description: string | null }>;
}

export interface WritingCorrection {
  readonly original: string;
  readonly correction: string;
  readonly explanation: string;
}

export interface WritingResult {
  readonly attemptId: string;
  /** 0-100, shown to the student only; never a mastery/level signal. */
  readonly score: number;
  readonly summary: string;
  readonly corrections: WritingCorrection[];
  readonly xpAwarded: number;
}

export interface SpeakingStartResult {
  readonly attemptId: string;
  readonly sessionId: string;
  readonly topic: PracticeTopicView;
}

export interface SpeakingCompleteResult {
  readonly attemptId: string;
  readonly xpAwarded: number;
}
