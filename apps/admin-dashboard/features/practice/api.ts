// Practice topics admin API (Practice Speaking + Write a Paragraph). The backend owns every rule;
// this module only sends admin edits.

import { backendFetch } from '../../core/api/client-api-helpers';

export type PracticeKind = 'speaking' | 'writing';
export type TopicText = { title: string; description?: string | null };

export type PracticeTopic = {
  readonly id: string;
  readonly kind: PracticeKind;
  readonly levelCode: string | null;
  readonly xpReward: number;
  readonly timeLimitSeconds: number | null;
  readonly minWords: number | null;
  readonly aiPrompt: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly translations: Record<string, TopicText>;
};

export type PracticeTopicInput = {
  kind?: PracticeKind;
  levelCode?: string | null;
  xpReward?: number;
  timeLimitSeconds?: number | null;
  minWords?: number | null;
  aiPrompt?: string;
  sortOrder?: number;
  isActive?: boolean;
  translations?: Record<string, TopicText>;
};

const BASE = '/admin/practice/topics';

async function unwrap<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    let message = `${fallback} (${res.status})`;
    try {
      const json = await res.json();
      const m = json?.error?.message ?? json?.message;
      message = Array.isArray(m) ? m.join(' ') : typeof m === 'string' ? m : message;
    } catch {
      // Non-JSON error body.
    }
    throw new Error(message);
  }
  const json = await res.json();
  return (json?.data ?? json) as T;
}

export const practiceApi = {
  list: async () => unwrap<PracticeTopic[]>(await backendFetch(BASE), 'Failed to load topics'),
  create: async (input: PracticeTopicInput) =>
    unwrap<{ id: string }>(await backendFetch(BASE, { method: 'POST', body: JSON.stringify(input) }), 'Failed to add topic'),
  update: async (id: string, input: PracticeTopicInput) =>
    unwrap<{ ok: true }>(await backendFetch(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(input) }), 'Failed to save topic'),
  remove: async (id: string) =>
    unwrap<{ deleted: boolean }>(await backendFetch(`${BASE}/${id}`, { method: 'DELETE' }), 'Failed to delete topic'),
};
