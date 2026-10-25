import { apiClient } from '../../api/client';

// Practice-session endpoints, mirroring Flutter features/question_answer:
//   POST /sessions/start { sessionType: 'lesson_practice', skillFocusIds: [] }
//   GET  /sessions/:sessionId/questions?lessonId=          — no correctness data
//   POST /sessions/:sessionId/attempt?feedback=true { itemId, answerValue, startedAt, includeFeedback: true }
//   GET  /sessions/:sessionId/summary                      — backend-evaluated counts
//   GET  /sessions/questions/:id/audio                     — listening_choice audio (204 when no script)

export interface StartSessionResponse {
  id: string;
  sessionType: string;
  status: string;
  startedAt: string;
  currentLevel: string;
  skillFocusIds: string[];
}

export interface SessionOption {
  id: string;
  text: string;
  order: number;
}

export interface SessionQuestion {
  id: string;
  /** question_bank.type: multiple_choice | true_false | listening_choice | fill_in_the_blank | … */
  type: string;
  stem: string;
  difficulty: string;
  tags: string[];
  options: SessionOption[];
}

export interface SessionQuestionsResponse {
  lessonId: string;
  questions: SessionQuestion[];
}

export interface AttemptResponse {
  attemptId: string;
  answerId: string;
  submittedAt: string;
  aimPipelineTriggered: boolean;
  aimOutcome: 'ok' | 'deferred';
  /** Backend-evaluated; present because feedback is requested. */
  isCorrect?: boolean;
}

export interface SessionSummary {
  sessionId: string;
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
  accuracyPercent: number;
  attempts: Array<{ itemId: string; isCorrect: boolean; answerValue: string }>;
}

const enc = encodeURIComponent;

export function startPracticeSession(): Promise<StartSessionResponse> {
  return apiClient.post<StartSessionResponse>('/sessions/start', {
    sessionType: 'lesson_practice',
    skillFocusIds: [],
  });
}

export async function fetchSessionQuestions(sessionId: string, lessonId: string): Promise<SessionQuestion[]> {
  const res = await apiClient.get<SessionQuestionsResponse>(
    `/sessions/${enc(sessionId)}/questions?lessonId=${enc(lessonId)}`,
  );
  return res?.questions ?? [];
}

export function submitAttempt(
  sessionId: string,
  body: { itemId: string; answerValue: string; startedAt: string },
): Promise<AttemptResponse> {
  return apiClient.post<AttemptResponse>(`/sessions/${enc(sessionId)}/attempt?feedback=true`, {
    ...body,
    includeFeedback: true,
  });
}

export function fetchSessionSummary(sessionId: string): Promise<SessionSummary> {
  return apiClient.get<SessionSummary>(`/sessions/${enc(sessionId)}/summary`);
}

/** Blob of the synthesized audio; an empty blob means no listening script yet (backend 204). */
export function fetchQuestionAudio(questionId: string): Promise<Blob> {
  return apiClient.getBlob(`/sessions/questions/${enc(questionId)}/audio`);
}
