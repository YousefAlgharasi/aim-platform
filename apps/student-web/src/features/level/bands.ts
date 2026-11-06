import type { StudentCourse } from '../curriculum/curriculumApi';

export const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Band = (typeof BANDS)[number];
export const BAND_NAME: Record<Band, string> = { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper intermediate', C1: 'Advanced', C2: 'Proficiency' };

/** "A2", "a2-foundation" → "A2". Placement words ("elementary") map to their CEFR band too. */
const WORD_BAND: Record<string, Band> = { beginner: 'A1', elementary: 'A2', intermediate: 'B1', upper_intermediate: 'B2', advanced: 'C1' };
export const bandOf = (levelCode: string | null | undefined): Band | null => {
  const raw = (levelCode ?? '').trim();
  const m = /^([ABC][12])/i.exec(raw);
  if (m) return m[1].toUpperCase() as Band;
  return WORD_BAND[raw.toLowerCase().replace(/\s+/g, '_')] ?? null;
};
export const bandIndex = (b: Band | null): number => (b ? BANDS.indexOf(b) : -1);

export interface BandSummary { band: Band; courses: number; lessons: number; done: number; percent: number; state: 'done' | 'current' | 'next' }

/** Group courses into CEFR bands; the first band that is not finished is "current". */
export function summarizeBands(courses: StudentCourse[]): BandSummary[] {
  const rows = BANDS.map((band) => {
    const list = courses.filter((c) => bandOf(c.levelCode) === band);
    const lessons = list.reduce((n, c) => n + c.lessonCount, 0);
    const done = list.reduce((n, c) => n + c.completedLessonCount, 0);
    return { band, courses: list.length, lessons, done, percent: lessons ? Math.round((done / lessons) * 100) : 0 };
  }).filter((r) => r.courses > 0);
  const currentIdx = rows.findIndex((r) => r.done < r.lessons);
  return rows.map((r, i) => ({ ...r, state: currentIdx === -1 || i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'next' }));
}

/**
 * The student's working level: the higher of what the placement test found and the first band they have not
 * finished. Someone who tested into B1 is at B1 even with no lessons done; someone who finished A1 is at A2+.
 */
export function effectiveBand(placement: Band | null, courses: StudentCourse[]): Band | null {
  const rows = summarizeBands(courses);
  const cur = rows.find((r) => r.state === 'current')?.band ?? (rows.length ? rows[rows.length - 1].band : null);
  const hasProgress = courses.some((c) => c.completedLessonCount > 0);
  const fromProgress = hasProgress ? cur : null;
  return bandIndex(placement) >= bandIndex(fromProgress) ? placement : fromProgress;
}

export type Relation = 'passed' | 'current' | 'ahead' | 'unknown';
/** How a course's band compares with the student's level. */
export function relationTo(courseBand: Band | null, level: Band | null): Relation {
  if (!courseBand || !level) return 'unknown';
  const d = bandIndex(courseBand) - bandIndex(level);
  return d < 0 ? 'passed' : d === 0 ? 'current' : 'ahead';
}
