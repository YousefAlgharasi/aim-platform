import { apiClient } from '../../api/client';

/** skill key (e.g. "en.a1.pho.short_vowels") → its real title ("Short Vowel Sounds"), filled once per session. */
let titles: Record<string, string> = {};
let loading: Promise<void> | null = null;

/** The real title of a skill, or null when it is not known (not loaded yet, or not a catalogue skill). */
export function skillTitle(skillId: string): string | null {
  return titles[skillId] ?? null;
}

/**
 * Loads the skill titles from the backend (once; a failure is forgotten so the next call retries).
 * Never throws: a missing catalogue only means skills fall back to a tidied-up version of their key.
 */
export function loadSkillTitles(): Promise<void> {
  if (loading) return loading;
  loading = apiClient
    .get<{ skills?: Array<{ key: string; title: string }> } | null>('/student/skills/titles')
    .then((res) => {
      titles = Object.fromEntries((res?.skills ?? []).filter((s) => s.key && s.title).map((s) => [s.key, s.title]));
    })
    .catch(() => {
      loading = null;
    });
  return loading;
}

/** Test helper: forget what was loaded. */
export function resetSkillTitles(): void {
  titles = {};
  loading = null;
}
