import { apiClient } from '../../api/client';

// Backend: services/backend-api/src/features/learner-tools (GET /student/stories, GET /student/stories/:id,
// POST /student/stories/:id/start). Answers go through POST /sessions/:id/attempt, so the AIM engine updates mastery.

export type StorySpeaker = 'narrator' | 'sarah' | 'adam' | 'yasmin' | 'tariq';
export interface StoryLine { speaker: StorySpeaker; text: string }
export interface StoryQuestion { itemId: string; type: string; prompt: string; options: Array<{ id: string; text: string }> }
export interface StorySceneData { position: number; setting: string; settingAr: string | null; lines: StoryLine[]; questions: StoryQuestion[]; done: boolean }

export interface StorySummary {
  storyId: string; courseTitle: string; cefrCode: string | null; title: string; titleAr: string | null; summary: string; summaryAr: string | null;
  scenes: number; questions: number; answered: number; words: number; minutes: number; locked: boolean; completed: boolean;
}
export interface StoryDetail extends StorySummary { sceneList: StoryScene[]; resumeScene: number }
export type StoryScene = StorySceneData;

export const storiesApi = {
  list: () => apiClient.get<{ stories: StorySummary[] }>('/student/stories'),
  get: (id: string) => apiClient.get<StoryDetail>(`/student/stories/${encodeURIComponent(id)}`),
  start: (id: string) => apiClient.post<{ sessionId: string }>(`/student/stories/${encodeURIComponent(id)}/start`, {}),
};

/** Where to resume: the first scene whose questions are not all answered, or the start when everything is done. */
export const resumeLabelKey = (s: StorySummary): 'Read again' | 'Continue' | 'Start reading' =>
  s.completed ? 'Read again' : s.answered > 0 ? 'Continue' : 'Start reading';

/** Whole-story progress 0..100 from the student's real answers. */
export const storyPercent = (s: Pick<StorySummary, 'questions' | 'answered'>): number =>
  s.questions > 0 ? Math.min(100, Math.round((s.answered / s.questions) * 100)) : 0;
