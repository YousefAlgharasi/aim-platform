// Pure helpers for the story editor: blank pieces, moving and removing items, and a quick check
// that mirrors the backend's rules so the admin sees problems before saving. The backend checks again.

import type { StoryInput, StoryLine, StoryQuestion, StoryScene, StorySpeaker } from './api';

export const SPEAKERS: Array<{ value: StorySpeaker; label: string }> = [
  { value: 'narrator', label: 'Narrator' },
  { value: 'sarah', label: 'Sarah' },
  { value: 'adam', label: 'Adam' },
  { value: 'yasmin', label: 'Yasmin' },
  { value: 'tariq', label: 'Tariq' },
];

export const emptyLine = (speaker: StorySpeaker = 'narrator'): StoryLine => ({ speaker, text: '' });
export const emptyQuestion = (skillKey: string | null = null): StoryQuestion => ({
  stem: '', explanation: null, skillKey,
  options: [{ text: '', correct: true }, { text: '', correct: false }, { text: '', correct: false }],
});
export const emptyScene = (skillKey: string | null = null): StoryScene => ({
  setting: '', settingAr: null, lines: [emptyLine('narrator'), emptyLine('sarah')], questions: [emptyQuestion(skillKey)],
});
export const emptyStory = (courseId: string, skillKey: string | null = null): StoryInput => ({
  courseId, title: '', titleAr: null, summary: '', summaryAr: null, status: 'draft', scenes: [emptyScene(skillKey)],
});

/** Move item [i] up (-1) or down (+1); returns a new array (unchanged when it cannot move). */
export function moveItem<T>(items: readonly T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (i < 0 || i >= items.length || j < 0 || j >= items.length) return [...items];
  const next = [...items];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export const removeItem = <T,>(items: readonly T[], i: number): T[] => items.filter((_, k) => k !== i);
export const replaceItem = <T,>(items: readonly T[], i: number, value: T): T[] => items.map((x, k) => (k === i ? value : x));

/** Make [index] the only correct answer of a question. */
export function markCorrect(q: StoryQuestion, index: number): StoryQuestion {
  return { ...q, options: q.options.map((o, k) => ({ ...o, correct: k === index })) };
}

/** Empty text becomes null, so optional fields are stored as "not set". */
export const orNull = (v: string): string | null => (v.trim() ? v : null);

/** The same rules the backend enforces, in plain words (it re-checks on save). */
export function checkStory(s: StoryInput): string[] {
  const out: string[] = [];
  if (!s.title.trim()) out.push('The story needs a title.');
  if (!s.summary.trim()) out.push('The story needs a short summary.');
  if (s.scenes.length === 0) out.push('Add at least one scene.');
  s.scenes.forEach((sc, si) => {
    const at = `Scene ${si + 1}`;
    if (!sc.setting.trim()) out.push(`${at} needs a place (setting).`);
    if (sc.lines.length === 0) out.push(`${at} needs at least one line.`);
    sc.lines.forEach((l, li) => { if (!l.text.trim()) out.push(`${at}, line ${li + 1} is empty.`); });
    if (s.status === 'published' && sc.questions.length === 0) out.push(`${at} needs at least one question before the story can be published.`);
    sc.questions.forEach((q, qi) => {
      const qa = `${at}, question ${qi + 1}`;
      if (q.stem.trim().length < 8) out.push(`${qa}: write the question (at least 8 characters).`);
      if (q.options.length < 2 || q.options.length > 4) out.push(`${qa}: give 2 to 4 answers.`);
      if (q.options.some((o) => !o.text.trim())) out.push(`${qa}: an answer is empty.`);
      if (new Set(q.options.map((o) => o.text.trim().toLowerCase())).size !== q.options.length) out.push(`${qa}: two answers are the same.`);
      if (q.options.filter((o) => o.correct).length !== 1) out.push(`${qa}: mark exactly one correct answer.`);
    });
  });
  return out;
}
