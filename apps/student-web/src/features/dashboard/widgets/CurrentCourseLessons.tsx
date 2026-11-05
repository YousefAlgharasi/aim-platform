import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { CheckIcon } from '../../../components/common/Icons';
import { LockIcon } from '../../curriculum/CurriculumIcons';
import {
  fetchCourseLevels,
  fetchStudentChapters,
  fetchStudentCourses,
  type StudentChapter,
} from '../../curriculum/curriculumApi';
import { fetchStudentLessons, type StudentLessonSummary } from '../../lessons/lessonsApi';

export type RowStatus = 'completed' | 'current' | 'available' | 'locked';

export interface CurrentChapter {
  chapter: StudentChapter;
  chapterNumber: number;
  chapterCount: number;
  lessons: StudentLessonSummary[];
}

/** Status of each lesson in a chapter, with the same rules as the course page (later lessons open after the current one). */
export function lessonStatuses(lessons: StudentLessonSummary[]): RowStatus[] {
  const currentIndex = lessons.findIndex((l) => l.current);
  return lessons.map((l, i) => (l.completed ? 'completed' : l.current ? 'current' : currentIndex >= 0 && i > currentIndex ? 'locked' : 'available'));
}

/** The lesson the student should do next in this chapter: the marked current one, else the first unfinished open one. */
export function nextLesson(lessons: StudentLessonSummary[]): StudentLessonSummary | null {
  const statuses = lessonStatuses(lessons);
  const i = statuses.findIndex((s) => s === 'current');
  if (i >= 0) return lessons[i];
  const j = statuses.findIndex((s) => s === 'available');
  return j >= 0 ? lessons[j] : null;
}

/**
 * Loads the active chapter of the student's course: the same lock rules as the course page (a chapter opens once
 * the one before it is complete) and never bypassing the backend gates. 'hidden' when the course is locked/unpaid,
 * finished, or any request fails.
 */
export function useCurrentChapter(courseId: string | null): { state: 'idle' | 'loading' | 'hidden' | 'ready'; chapter: CurrentChapter | null } {
  const [state, setState] = useState<'idle' | 'loading' | 'hidden' | 'ready'>(courseId ? 'loading' : 'idle');
  const [chapter, setChapter] = useState<CurrentChapter | null>(null);

  useEffect(() => {
    if (!courseId) { setState('idle'); setChapter(null); return undefined; }
    let cancelled = false;
    setState('loading');
    (async () => {
      const courses = await fetchStudentCourses();
      const course = courses.find((c) => c.courseId === courseId);
      if (!course || course.locked) return null;

      const levels = await fetchCourseLevels(courseId);
      const perLevel = await Promise.all(levels.map((l) => fetchStudentChapters(l.id)));
      const ordered = perLevel.flatMap((r) => r.chapters);
      const isLocked = (i: number) => ordered[i].status !== 'completed' && i > 0 && ordered[i - 1].status !== 'completed';
      let idx = ordered.findIndex((ch, i) => ch.status === 'in_progress' && !isLocked(i));
      if (idx < 0) idx = ordered.findIndex((ch, i) => ch.status !== 'completed' && !isLocked(i));
      if (idx < 0) return null;

      const { lessons } = await fetchStudentLessons(ordered[idx].chapterId);
      if (lessons.length === 0) return null;
      return { chapter: ordered[idx], chapterNumber: idx + 1, chapterCount: ordered.length, lessons };
    })()
      .then((result) => {
        if (cancelled) return;
        setChapter(result);
        setState(result ? 'ready' : 'hidden');
      })
      .catch(() => !cancelled && setState('hidden'));
    return () => { cancelled = true; };
  }, [courseId]);

  return { state, chapter };
}

const SHOWN = 5;

/** The current chapter's lessons, on Home: a compact version of the course page's roadmap. */
export function CurrentCourseLessons({ courseId, courseTitle, data }: { courseId: string; courseTitle: string | null; data: CurrentChapter }) {
  const { t } = useI18n();
  const { chapter, chapterNumber, chapterCount, lessons } = data;
  const statuses = lessonStatuses(lessons);
  // Keep the list short: start a little before the next lesson so there is context, show a few after it.
  const focus = Math.max(0, statuses.findIndex((s) => s === 'current' || s === 'available'));
  const start = Math.min(Math.max(0, focus - 1), Math.max(0, lessons.length - SHOWN));
  const visible = lessons.slice(start, start + SHOWN);
  const done = lessons.filter((l) => l.completed).length;
  const pct = Math.round((done / lessons.length) * 100);

  return (
    <section aria-label={t('Your course lessons')} className="rounded-3xl bg-surface p-5 shadow-card ring-1 ring-line sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-base font-extrabold tracking-tight text-ink">{t('Your course lessons')}</h2>
          <p className="m-0 mt-0.5 truncate text-xs font-medium text-ink-muted [unicode-bidi:plaintext]">{courseTitle ?? ''}</p>
        </div>
        <Link to={`/curriculum/${courseId}`} className="shrink-0 rounded text-xs font-bold text-brand-ink no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {t('All chapters')}
        </Link>
      </div>

      <div className="mt-4 rounded-2xl bg-surface-sunken p-3">
        <p className="m-0 text-sm font-extrabold leading-snug text-ink [overflow-wrap:anywhere] [unicode-bidi:plaintext]">
          {t('Chapter {n}: {title}', { n: chapterNumber, title: chapter.title })}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-strong" role="progressbar" aria-label={t('Chapter progress')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="whitespace-nowrap text-xs font-bold tabular-nums text-ink-muted">{t('{done}/{total} lessons', { done, total: lessons.length })}</span>
        </div>
        {chapterCount > 1 && <p className="m-0 mt-1.5 text-xs text-ink-muted">{t('Chapter {n} of {total}', { n: chapterNumber, total: chapterCount })}</p>}
      </div>

      <ol className="m-0 mt-4 list-none p-0" role="list">
        {visible.map((lesson, k) => {
          const i = start + k;
          const status = statuses[i];
          const last = k === visible.length - 1;
          const locked = status === 'locked';
          const node = status === 'completed' ? 'bg-success text-white' : status === 'current' ? 'bg-brand text-white ring-4 ring-brand/20' : status === 'available' ? 'bg-brand-soft text-brand-ink ring-2 ring-brand-line' : 'bg-surface-muted text-ink-muted ring-1 ring-line';
          const card = status === 'current' ? 'bg-brand-soft ring-2 ring-brand' : status === 'completed' ? 'bg-surface ring-1 ring-line' : locked ? 'bg-surface-sunken ring-1 ring-line-subtle' : 'bg-surface ring-1 ring-line hover:ring-brand-line';
          const inner = (
            <>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-ink-muted">{t('Lesson {n}', { n: i + 1 })}</span>
                <span className={`block text-sm font-bold leading-snug [overflow-wrap:anywhere] [unicode-bidi:plaintext] ${locked ? 'text-ink-muted' : 'text-ink'}`}>{lesson.title}</span>
              </span>
              {status === 'current' && <span className="shrink-0 rounded-full bg-brand px-2.5 py-1 text-[11px] font-extrabold text-white">{t('Next')}</span>}
              {status === 'completed' && <span className="shrink-0 text-xs font-bold text-success-ink">{t('Done')}</span>}
            </>
          );
          return (
            <li key={lesson.id} role="listitem" aria-disabled={locked ? true : undefined} title={locked ? t('Complete the previous lesson first') : undefined} className="flex gap-3">
              <div className="flex w-9 shrink-0 flex-col items-center">
                <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-extrabold ${node}`}>
                  {status === 'completed' ? <CheckIcon className="size-4 text-white" /> : locked ? <LockIcon className="size-3.5" /> : i + 1}
                </span>
                {!last && <span aria-hidden="true" className={`my-1 w-0.5 flex-1 rounded-full ${status === 'completed' ? 'bg-success/60' : 'bg-line'}`} />}
              </div>
              <div className="flex min-w-0 flex-1 pb-2.5">
                {locked ? (
                  <div className={`flex min-h-12 flex-1 items-center gap-3 rounded-2xl px-3.5 py-2.5 ${card}`}>{inner}</div>
                ) : (
                  <Link to={`/lessons/${lesson.id}`} state={{ courseId }} className={`flex min-h-12 flex-1 items-center gap-3 rounded-2xl px-3.5 py-2.5 no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${card}`}>
                    {inner}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {lessons.length > visible.length && (
        <Link to={`/curriculum/${courseId}`} className="mt-1 inline-block text-xs font-bold text-brand-ink no-underline hover:underline">
          {t('+{n} more lessons in this chapter', { n: lessons.length - visible.length })} →
        </Link>
      )}
    </section>
  );
}
