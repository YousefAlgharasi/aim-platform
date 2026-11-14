import { STORY_SPEAKERS, StoryLine, StorySpeaker } from './stories.service';

/** What an admin sends when creating or saving a story. Everything is checked here, before anything is written. */
export interface StoryInputQuestion {
  /** Present when editing an existing question: keeps its id (and so the students' answers to it). */
  id?: string;
  stem: string;
  explanation: string | null;
  skillKey: string | null;
  options: Array<{ text: string; correct: boolean }>;
}
export interface StoryInputScene {
  id?: string;
  setting: string;
  settingAr: string | null;
  lines: StoryLine[];
  questions: StoryInputQuestion[];
}
export type StoryStatus = 'draft' | 'published' | 'archived';
export interface StoryInput {
  courseId: string | null;
  title: string;
  titleAr: string | null;
  summary: string;
  summaryAr: string | null;
  status: StoryStatus;
  scenes: StoryInputScene[];
}

export const STORY_STATUSES: readonly StoryStatus[] = ['draft', 'published', 'archived'];
const LIMITS = { title: 120, summary: 400, setting: 120, line: 600, stem: 400, option: 160, explanation: 400, scenes: 30, lines: 40, questions: 6 };
const LOOSE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const optStr = (v: unknown): string | null => { const s = str(v); return s ? s : null; };

/** Pure: validate an admin's story payload. Returns every problem at once so the form can show them together. */
export function validateStoryInput(raw: unknown): { ok: true; value: StoryInput } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const b = (raw ?? {}) as Record<string, unknown>;
  const title = str(b.title);
  const summary = str(b.summary);
  const status = (typeof b.status === 'string' ? b.status : 'draft') as StoryStatus;
  if (!title) errors.push('The story needs a title.');
  else if (title.length > LIMITS.title) errors.push(`The title is longer than ${LIMITS.title} characters.`);
  if (!summary) errors.push('The story needs a short summary.');
  else if (summary.length > LIMITS.summary) errors.push(`The summary is longer than ${LIMITS.summary} characters.`);
  if (!STORY_STATUSES.includes(status)) errors.push('Status must be draft, published or archived.');
  const courseId = b.courseId === undefined || b.courseId === null || b.courseId === '' ? null : String(b.courseId);
  if (courseId && !LOOSE_UUID.test(courseId)) errors.push('courseId is not valid.');

  const scenesRaw = Array.isArray(b.scenes) ? (b.scenes as unknown[]) : [];
  if (scenesRaw.length === 0) errors.push('Add at least one scene.');
  if (scenesRaw.length > LIMITS.scenes) errors.push(`A story can have at most ${LIMITS.scenes} scenes.`);

  const scenes: StoryInputScene[] = scenesRaw.slice(0, LIMITS.scenes).map((sRaw, si) => {
    const s = (sRaw ?? {}) as Record<string, unknown>;
    const at = `Scene ${si + 1}`;
    const setting = str(s.setting);
    if (!setting) errors.push(`${at} needs a place (setting).`);
    else if (setting.length > LIMITS.setting) errors.push(`${at}: the setting is longer than ${LIMITS.setting} characters.`);

    const linesRaw = Array.isArray(s.lines) ? (s.lines as unknown[]) : [];
    if (linesRaw.length === 0) errors.push(`${at} needs at least one line.`);
    if (linesRaw.length > LIMITS.lines) errors.push(`${at} can have at most ${LIMITS.lines} lines.`);
    const lines: StoryLine[] = linesRaw.slice(0, LIMITS.lines).map((lRaw, li) => {
      const l = (lRaw ?? {}) as Record<string, unknown>;
      const speaker = typeof l.speaker === 'string' ? l.speaker.toLowerCase() : '';
      const text = str(l.text);
      if (!(STORY_SPEAKERS as readonly string[]).includes(speaker)) errors.push(`${at}, line ${li + 1}: pick narrator, Sarah, Adam, Yasmin or Tariq.`);
      if (!text) errors.push(`${at}, line ${li + 1} is empty.`);
      else if (text.length > LIMITS.line) errors.push(`${at}, line ${li + 1} is longer than ${LIMITS.line} characters.`);
      return { speaker: speaker as StorySpeaker, text };
    });

    const qsRaw = Array.isArray(s.questions) ? (s.questions as unknown[]) : [];
    if (qsRaw.length > LIMITS.questions) errors.push(`${at} can have at most ${LIMITS.questions} questions.`);
    const questions: StoryInputQuestion[] = qsRaw.slice(0, LIMITS.questions).map((qRaw, qi) => {
      const q = (qRaw ?? {}) as Record<string, unknown>;
      const qa = `${at}, question ${qi + 1}`;
      const stem = str(q.stem);
      if (stem.length < 8) errors.push(`${qa}: write the question (at least 8 characters).`);
      else if (stem.length > LIMITS.stem) errors.push(`${qa}: the question is longer than ${LIMITS.stem} characters.`);
      const optsRaw = Array.isArray(q.options) ? (q.options as unknown[]) : [];
      const options = optsRaw.slice(0, 4).map((oRaw) => {
        const o = (oRaw ?? {}) as Record<string, unknown>;
        return { text: str(o.text), correct: o.correct === true };
      });
      if (optsRaw.length < 2 || optsRaw.length > 4) errors.push(`${qa}: give 2 to 4 answers.`);
      if (options.some((o) => !o.text)) errors.push(`${qa}: an answer is empty.`);
      if (options.some((o) => o.text.length > LIMITS.option)) errors.push(`${qa}: an answer is longer than ${LIMITS.option} characters.`);
      if (new Set(options.map((o) => o.text.toLowerCase())).size !== options.length) errors.push(`${qa}: two answers are the same.`);
      if (options.filter((o) => o.correct).length !== 1) errors.push(`${qa}: mark exactly one correct answer.`);
      const explanation = optStr(q.explanation);
      if (explanation && explanation.length > LIMITS.explanation) errors.push(`${qa}: the explanation is longer than ${LIMITS.explanation} characters.`);
      const id = typeof q.id === 'string' && LOOSE_UUID.test(q.id) ? q.id : undefined;
      return { id, stem, explanation, skillKey: optStr(q.skillKey), options };
    });
    // A published story must give every scene something to answer, or its part could never count as read.
    if (status === 'published' && questions.length === 0) errors.push(`${at} needs at least one question before the story can be published.`);

    const id = typeof s.id === 'string' && LOOSE_UUID.test(s.id) ? s.id : undefined;
    return { id, setting, settingAr: optStr(s.settingAr), lines, questions };
  });

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { courseId, title, titleAr: optStr(b.titleAr), summary, summaryAr: optStr(b.summaryAr), status, scenes } };
}

/** Pure: the difficulty label a story's questions get, from how far up the course ladder it is. */
export function difficultyForCourseRank(rank: number | null): 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced' {
  const r = rank ?? 1;
  if (r <= 4) return 'beginner';
  if (r <= 6) return 'elementary';
  if (r <= 9) return 'intermediate';
  if (r <= 13) return 'upper_intermediate';
  return 'advanced';
}
