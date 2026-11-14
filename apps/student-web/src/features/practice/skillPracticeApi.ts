import { apiClient } from '../../api/client';

// Backend: services/backend-api/src/features/learner-tools (GET /student/practice/skills, POST /student/practice/start).
// Practice answers are sent through POST /sessions/:id/attempt, so the AIM engine updates mastery.

export type PracticeMode = 'grammar' | 'listening' | 'reading';
export const PRACTICE_MODES: PracticeMode[] = ['grammar', 'listening', 'reading'];

export interface PracticeSkill { skillKey: string; title: string; masteryScore: number | null; questionCount: number; recommended: boolean }
export interface PracticeQuestion {
  itemId: string; type: string; prompt: string; options: Array<{ id: string; text: string }>; source: 'bank' | 'ai';
}
export interface PracticeStart {
  sessionId: string; mode: PracticeMode; skillKey: string; title: string; level: string;
  /** Reading only: shown once above the questions. */
  passage: string | null; questions: PracticeQuestion[];
}

export const skillPracticeApi = {
  skills: (mode: PracticeMode) => apiClient.get<{ mode: PracticeMode; level: string; skills: PracticeSkill[] }>(`/student/practice/skills?mode=${mode}`),
  start: (mode: PracticeMode, skillKey?: string) => apiClient.post<PracticeStart>('/student/practice/start', { mode, skillKey }),
};

export const isPracticeMode = (v: string | undefined): v is PracticeMode => !!v && (PRACTICE_MODES as string[]).includes(v);
