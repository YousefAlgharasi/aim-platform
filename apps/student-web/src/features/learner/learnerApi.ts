import { apiClient } from '../../api/client';

// ── Saved words ──────────────────────────────────────────────────────────────
export type WordSource = 'manual' | 'chat' | 'lesson' | 'voice';
export interface SavedWord {
  id: string; word: string; meaning: string | null; context: string | null; source: WordSource;
  box: number; nextReviewAt: string; timesCorrect: number; timesWrong: number; createdAt: string;
}
export const vocabularyApi = {
  list: () => apiClient.get<{ words: SavedWord[]; dueCount: number }>('/vocabulary'),
  save: (input: { word: string; meaning?: string; context?: string; source?: WordSource }) =>
    apiClient.post<SavedWord>('/vocabulary', input),
  remove: (id: string) => apiClient.delete<void>(`/vocabulary/${encodeURIComponent(id)}`),
  due: () => apiClient.get<{ cards: SavedWord[] }>('/vocabulary/review'),
  review: (id: string, correct: boolean) =>
    apiClient.post<SavedWord>(`/vocabulary/${encodeURIComponent(id)}/review`, { correct }),
};

// ── Study plan (onboarding) ──────────────────────────────────────────────────
export type PlanGoal = 'work' | 'study' | 'travel' | 'fun' | 'other';
export interface StudyPlan { goal: PlanGoal; dailyMinutes: number; reminderTime: string | null; dailyGoalLessons: number }
export const studyPlanApi = {
  get: () => apiClient.get<{ plan: StudyPlan | null }>('/student/study-plan'),
  save: (input: { goal: PlanGoal; dailyMinutes: number; reminderTime?: string | null }) =>
    apiClient.put<{ plan: StudyPlan }>('/student/study-plan', input),
  /** The dashboard's daily lesson goal is a separate, existing setting. */
  setDailyGoal: (dailyGoalLessons: number) => apiClient.put<unknown>('/student/engagement/goal', { dailyGoalLessons }),
};

// ── Mistakes retry ───────────────────────────────────────────────────────────
export interface MistakeItem {
  itemId: string; type: string; prompt: string; listeningScript: string | null;
  options: Array<{ id: string; text: string }>; yourAnswer: string | null; answeredAt: string;
}
export interface MistakeCheck { correct: boolean; correctChoiceId: string | null; correctText: string | null; explanation: string | null }
export const mistakesApi = {
  list: () => apiClient.get<{ total: number; items: MistakeItem[] }>('/student/mistakes'),
  check: (itemId: string, answerId: string) => apiClient.post<MistakeCheck>('/student/mistakes/check', { itemId, answerId }),
};

// ── Public catalog ───────────────────────────────────────────────────────────
export interface PublicCourse { id: string; title: string; description: string | null; levelCode: string | null; cefrCode: string | null; lessonCount: number }
export const publicApi = {
  catalog: (locale: string) =>
    apiClient.get<{ courses: PublicCourse[] }>(`/public/catalog?locale=${encodeURIComponent(locale)}`, { auth: false }),
};
