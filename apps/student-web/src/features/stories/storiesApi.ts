import { apiClient } from '../../api/client';

// Backend: services/backend-api/src/features/learner-tools. A course's story is split into one PART per chapter; a part
// opens when that chapter's lessons are finished. Answers go through POST /sessions/:id/attempt, so AIM updates mastery.

export type StorySpeaker = 'narrator' | 'sarah' | 'adam' | 'yasmin' | 'tariq';
export interface StoryLine { speaker: StorySpeaker; text: string }
export interface StoryQuestion { itemId: string; type: string; prompt: string; options: Array<{ id: string; text: string }> }
export interface StoryScene { position: number; setting: string; settingAr: string | null; lines: StoryLine[]; questions: StoryQuestion[]; done: boolean }

export interface StorySummary {
  storyId: string; courseId?: string; courseTitle: string; cefrCode: string | null; title: string; titleAr: string | null; summary: string; summaryAr: string | null;
  scenes: number; questions: number; answered: number; words: number; minutes: number; locked: boolean; completed: boolean;
}
export interface StoryPart {
  index: number; chapterId: string; chapterTitle: string; scenes: number; questions: number; answered: number;
  /** The chapter's lessons are all finished. */
  unlocked: boolean; done: boolean;
}
export interface CourseStory extends StorySummary { parts: StoryPart[]; partsRead: number }
export interface StoryDetail extends StorySummary { sceneList: StoryScene[]; resumeScene: number; part: number | null; partCount: number }

export const storiesApi = {
  forCourse: (courseId: string) => apiClient.get<{ story: CourseStory | null }>(`/student/courses/${encodeURIComponent(courseId)}/story`),
  get: (id: string, part?: number) => apiClient.get<StoryDetail>(`/student/stories/${encodeURIComponent(id)}${part === undefined ? '' : `?part=${part}`}`),
  start: (id: string, part?: number) => apiClient.post<{ sessionId: string }>(`/student/stories/${encodeURIComponent(id)}/start`, part === undefined ? {} : { part }),
};

/** The part to open next: the first one that is unlocked and not finished. Null when none is open or all are read. */
export function nextPartToRead(parts: StoryPart[]): StoryPart | null {
  return parts.find((p) => p.unlocked && !p.done) ?? null;
}

/** Where a part of a story is read. */
export const storyPartPath = (storyId: string, part: number): string => `/stories/${storyId}?part=${part}`;
