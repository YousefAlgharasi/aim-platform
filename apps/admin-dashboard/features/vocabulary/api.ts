// Vocabulary library admin API (words students browse, listen to and save). The backend owns every
// rule; this module only sends admin edits.

import { backendFetch } from '../../core/api/client-api-helpers';

export type VocabLevel = 'beginner' | 'intermediate' | 'advanced';
export const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'phrase'] as const;

export type VocabularyWord = {
  readonly id: string;
  readonly word: string;
  readonly translationAr: string;
  readonly exampleSentence: string;
  readonly partOfSpeech: string | null;
  readonly level: VocabLevel;
  readonly sortOrder: number;
  readonly isActive: boolean;
};

export type VocabularyWordInput = {
  word?: string;
  translationAr?: string;
  exampleSentence?: string;
  partOfSpeech?: string | null;
  level?: VocabLevel;
  sortOrder?: number;
  isActive?: boolean;
};

export type VocabularyList = {
  words: VocabularyWord[];
  total: number;
  counts: Partial<Record<VocabLevel, number>>;
  limit: number;
  offset: number;
};

const BASE = '/admin/vocabulary-library';

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

export const vocabularyApi = {
  list: async (params: { level?: VocabLevel; q?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params.level) qs.set('level', params.level);
    if (params.q) qs.set('q', params.q);
    qs.set('limit', String(params.limit ?? 50));
    qs.set('offset', String(params.offset ?? 0));
    return unwrap<VocabularyList>(await backendFetch(`${BASE}?${qs}`), 'Failed to load words');
  },
  create: async (input: VocabularyWordInput) =>
    unwrap<VocabularyWord>(await backendFetch(BASE, { method: 'POST', body: JSON.stringify(input) }), 'Failed to add word'),
  update: async (id: string, input: VocabularyWordInput) =>
    unwrap<VocabularyWord>(await backendFetch(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(input) }), 'Failed to save word'),
  remove: async (id: string) =>
    unwrap<{ deleted: true }>(await backendFetch(`${BASE}/${id}`, { method: 'DELETE' }), 'Failed to delete word'),
};
