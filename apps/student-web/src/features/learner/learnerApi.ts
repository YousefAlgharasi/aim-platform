import { apiClient } from '../../api/client';

// ── Saved words ──────────────────────────────────────────────────────────────
export type WordSource = 'manual' | 'chat' | 'lesson' | 'voice' | 'library';
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

// ── Vocabulary library ───────────────────────────────────────────────────────
export type VocabLevel = 'beginner' | 'intermediate' | 'advanced';
export interface LibraryWord {
  id: string; word: string; translationAr: string; exampleSentence: string;
  partOfSpeech: string | null; level: VocabLevel; saved: boolean;
}
export const vocabularyLibraryApi = {
  list: (params: { level?: VocabLevel; q?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params.level) qs.set('level', params.level);
    if (params.q) qs.set('q', params.q);
    qs.set('limit', String(params.limit ?? 24));
    qs.set('offset', String(params.offset ?? 0));
    return apiClient.get<{ words: LibraryWord[]; total: number; limit: number; offset: number }>(`/vocabulary-library?${qs}`);
  },
  save: (id: string) => apiClient.post<{ saved: true }>(`/vocabulary-library/${encodeURIComponent(id)}/save`, {}),
  unsave: (id: string) => apiClient.delete<{ saved: false }>(`/vocabulary-library/${encodeURIComponent(id)}/save`),
  audio: (id: string) => apiClient.getBlob(`/vocabulary-library/${encodeURIComponent(id)}/audio`),
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
  /** Skill keys the question trains. Absent on older backends. */
  skillIds?: string[];
  options: Array<{ id: string; text: string }>; yourAnswer: string | null; answeredAt: string;
}
export interface MistakeCheck { correct: boolean; correctChoiceId: string | null; correctText: string | null; explanation: string | null }
export const mistakesApi = {
  /** Wrong answers still to fix; pass a skill key to get only that skill's. */
  list: (skill?: string) => apiClient.get<{ total: number; items: MistakeItem[] }>(`/student/mistakes${skill ? `?skill=${encodeURIComponent(skill)}` : ''}`),
  check: (itemId: string, answerId: string) => apiClient.post<MistakeCheck>('/student/mistakes/check', { itemId, answerId }),
};

// ── Recovery (Improve retry loop) ────────────────────────────────────────────
export type SkillGroup = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing' | 'speaking';
export interface RecoverySkill {
  skillKey: string; title: string; group: SkillGroup; masteryScore: number | null; openMistakes: number;
  lastMistakeAt: string | null;
  /** null when there is nothing to wait for. */
  retryAvailableAt: string | null; unlocked: boolean;
}
export interface RecoveryQuestion {
  itemId: string; type: string; prompt: string; options: Array<{ id: string; text: string }>; source: 'missed' | 'bank' | 'ai';
}
export interface RecoveryStart { sessionId: string; skillKey: string; level: string; questions: RecoveryQuestion[] }
export const recoveryApi = {
  overview: () => apiClient.get<{ cooldownDays: number; skills: RecoverySkill[] }>('/student/recovery'),
  /** 403 with retryAvailableAt while the cooldown runs. Answers are then sent through /sessions/:id/attempt. */
  start: (skillKey: string) => apiClient.post<RecoveryStart>('/student/recovery/start', { skillKey }),
};

// ── Public catalog ───────────────────────────────────────────────────────────
export interface PublicCourse { id: string; title: string; description: string | null; levelCode: string | null; cefrCode: string | null; lessonCount: number }
export const publicApi = {
  catalog: (locale: string) =>
    apiClient.get<{ courses: PublicCourse[] }>(`/public/catalog?locale=${encodeURIComponent(locale)}`, { auth: false }),
};
