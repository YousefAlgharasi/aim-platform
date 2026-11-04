import { apiClient } from '../../api/client';

// Contracts mirror services/backend-api/src/features/practice (student-practice.controller.ts).
// Access is checked by the backend: no started/active course -> 402 COURSE_PAYMENT_REQUIRED.

export type PracticeKind = 'speaking' | 'writing';

export interface PracticeTopic {
  id: string;
  kind: PracticeKind;
  title: string;
  description: string | null;
  levelCode: string | null;
  xpReward: number;
  timeLimitSeconds: number | null;
  minWords: number | null;
}

export interface SpeakingStart {
  attemptId: string;
  sessionId: string;
  topic: PracticeTopic;
}

export interface WritingCorrection {
  original: string;
  correction: string;
  explanation: string;
}

export interface WritingResult {
  attemptId: string;
  /** 0-100, display only. */
  score: number;
  summary: string;
  corrections: WritingCorrection[];
  xpAwarded: number;
}

/** State handed to the Voice Teacher screen so it can show the practice header + finish button. */
export interface PracticeSessionState {
  attemptId: string;
  title: string;
  xpReward: number;
  timeLimitSeconds: number | null;
}

export const practiceTopicsApi = {
  list: (kind: PracticeKind) => apiClient.get<PracticeTopic[]>(`/student/practice/topics?kind=${kind}`),
  startSpeaking: (topicId: string) => apiClient.post<SpeakingStart>('/student/practice/speaking/start', { topicId }),
  completeSpeaking: (attemptId: string) =>
    apiClient.post<{ attemptId: string; xpAwarded: number }>(`/student/practice/speaking/${encodeURIComponent(attemptId)}/complete`, {}),
  submitWriting: (topicId: string, text: string) =>
    apiClient.post<WritingResult>('/student/practice/writing/submit', { topicId, text }),
};

/** 402: the student has no started course with access. */
export function isPracticeLocked(err: unknown): boolean {
  return (err as { statusCode?: number } | null)?.statusCode === 402;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
