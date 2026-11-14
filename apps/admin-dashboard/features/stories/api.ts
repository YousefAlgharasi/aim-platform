// Course stories admin API. The backend owns every rule (who can see a story, locks, scoring, validation);
// this module only sends admin edits.

import { backendFetch } from '../../core/api/client-api-helpers';

export type StorySpeaker = 'narrator' | 'sarah' | 'adam' | 'yasmin' | 'tariq';
export type StoryStatus = 'draft' | 'published' | 'archived';

export type StoryLine = { speaker: StorySpeaker; text: string };
export type StoryOption = { text: string; correct: boolean };
export type StoryQuestion = { id?: string; stem: string; explanation: string | null; skillKey: string | null; options: StoryOption[] };
export type StoryScene = { id?: string; setting: string; settingAr: string | null; lines: StoryLine[]; questions: StoryQuestion[] };

export type StoryInput = {
  courseId?: string | null;
  title: string;
  titleAr: string | null;
  summary: string;
  summaryAr: string | null;
  status: StoryStatus;
  scenes: StoryScene[];
};

export type StoryRow = {
  readonly storyId: string; readonly courseId: string; readonly courseTitle: string; readonly cefrCode: string | null;
  readonly title: string; readonly titleAr: string | null; readonly status: StoryStatus;
  readonly scenes: number; readonly questions: number; readonly words: number; readonly updatedAt: string;
};
export type CourseOption = { readonly id: string; readonly title: string; readonly cefrCode: string | null };
export type StoryDetail = StoryInput & {
  readonly storyId: string; readonly courseId: string; readonly courseTitle: string; readonly cefrCode: string | null;
  readonly skills: Array<{ key: string; title: string }>;
};

/** An error that keeps every message the backend sent, so the form can list them. */
export class StoryApiError extends Error {
  constructor(readonly messages: string[]) {
    super(messages.join(' '));
  }
}

const BASE = '/admin/stories';

async function unwrap<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    let messages = [`${fallback} (${res.status})`];
    try {
      const json = await res.json();
      const m = json?.error?.message ?? json?.message;
      if (Array.isArray(m)) messages = m.map(String);
      else if (typeof m === 'string') messages = [m];
    } catch {
      // Non-JSON error body.
    }
    throw new StoryApiError(messages);
  }
  const json = await res.json();
  return (json?.data ?? json) as T;
}

export const storiesAdminApi = {
  list: async () => unwrap<{ stories: StoryRow[]; coursesWithoutStory: CourseOption[] }>(await backendFetch(BASE), 'Failed to load stories'),
  get: async (id: string) => unwrap<StoryDetail>(await backendFetch(`${BASE}/${id}`), 'Failed to load the story'),
  create: async (input: StoryInput) =>
    unwrap<{ storyId: string }>(await backendFetch(BASE, { method: 'POST', body: JSON.stringify(input) }), 'Failed to create the story'),
  save: async (id: string, input: StoryInput) =>
    unwrap<{ ok: true }>(await backendFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(input) }), 'Failed to save the story'),
  setStatus: async (id: string, status: StoryStatus) =>
    unwrap<{ ok: true }>(await backendFetch(`${BASE}/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }), 'Failed to change the status'),
  remove: async (id: string) =>
    unwrap<{ deleted: true }>(await backendFetch(`${BASE}/${id}`, { method: 'DELETE' }), 'Failed to delete the story'),
};
