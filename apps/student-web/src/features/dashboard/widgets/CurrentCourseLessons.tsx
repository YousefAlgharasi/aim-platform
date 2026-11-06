import { useEffect, useRef, useState, type RefObject } from 'react';
import * as ui from './ui';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { CheckIcon, ClipboardIcon } from '../../../components/common/Icons';
import { LockIcon } from '../../curriculum/CurriculumIcons';
import {
  fetchCourseLevels,
  fetchStudentChapters,
  fetchStudentCourses,
  type StudentChapter,
} from '../../curriculum/curriculumApi';
import { fetchStudentLessons, type ChapterQuizSummary, type StudentLessonSummary } from '../../lessons/lessonsApi';

export type RowStatus = 'completed' | 'current' | 'available' | 'locked';

export interface CurrentChapter {
  chapter: StudentChapter;
  chapterNumber: number;
  chapterCount: number;
  lessons: StudentLessonSummary[];
  /** The chapter's quiz, when it has one: the last stop on the roadmap. */
  quiz?: ChapterQuizSummary | null;
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

      const { lessons, quiz } = await fetchStudentLessons(ordered[idx].chapterId);
      if (lessons.length === 0) return null;
      return { chapter: ordered[idx], chapterNumber: idx + 1, chapterCount: ordered.length, lessons, quiz };
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

/** Space between two lessons on the road, and how thick the road and the rings are (px). */
const ROW = 116;
const ROAD = 22;
const RING = 10;

/** Width of an element, kept up to date, so the road can be drawn in real pixels (rounded bends stay round). */
function useWidth(ref: RefObject<HTMLElement | null>) {
  const [w, setW] = useState(480);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => setW(el.clientWidth || 480);
    read();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** The current chapter's lessons, on Home: a compact version of the course page's roadmap. */
export function CurrentCourseLessons({ courseId, courseTitle, data }: { courseId: string; courseTitle: string | null; data: CurrentChapter }) {
  const { t } = useI18n();
  const { chapter, chapterNumber, chapterCount, lessons, quiz } = data;
  const lessonStates = lessonStatuses(lessons);
  const done = lessons.filter((l) => l.completed).length;
  const pct = Math.round((done / lessons.length) * 100);
  // Every stop on the road: the lessons in order, then the chapter quiz (open once every lesson is done).
  interface Stop { key: string; kind: 'lesson' | 'quiz'; status: RowStatus; label: string; title: string; to: string; n: number }
  const stops: Stop[] = lessons.map((l, i) => ({ key: l.id, kind: 'lesson', status: lessonStates[i], label: t('Lesson {n}', { n: i + 1 }), title: l.title, to: `/lessons/${l.id}`, n: i + 1 }));
  if (quiz) {
    stops.push({
      key: `quiz-${quiz.assessmentId}`,
      kind: 'quiz',
      status: quiz.completed ? 'completed' : quiz.locked ? 'locked' : 'current',
      label: t('Chapter quiz'),
      title: quiz.title,
      to: `/assessments/${quiz.assessmentId}`,
      n: lessons.length + 1,
    });
  }
  const statuses = stops.map((st) => st.status);
  function explainLocked(i: number) {
    const stop = stops[i];
    const text = stop.kind === 'quiz' ? t('Finish every lesson to unlock the quiz') : t('Finish {lesson} first', { lesson: stops[i - 1]?.label ?? '' });
    if (nudgeTimer.current !== null) window.clearTimeout(nudgeTimer.current);
    setNudge((cur) => ({ key: stop.key, text, n: (cur?.n ?? 0) + 1 }));
    nudgeTimer.current = window.setTimeout(() => setNudge(null), 2600);
  }
  // The road zig-zags between a left and a right lane; physical coordinates, mirrored for right-to-left.
  const listRef = useRef<HTMLOListElement>(null);
  const width = useWidth(listRef);
  // Tapping a locked stop explains why it is locked (and shakes it a little) instead of doing nothing.
  const [nudge, setNudge] = useState<{ key: string; text: string; n: number } | null>(null);
  const nudgeTimer = useRef<number | null>(null);
  useEffect(() => () => { if (nudgeTimer.current !== null) window.clearTimeout(nudgeTimer.current); }, []);
  const rtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const laneL = Math.max(44, Math.round(width * 0.2));
  const laneR = width - laneL;
  const xs = stops.map((_, i) => ((i % 2 === 0) !== rtl ? laneL : laneR));
  const H = stops.length * ROW;
  const ys = stops.map((_, i) => i * ROW + ROW / 2);
  // One piece of road between two lessons: down, a rounded bend across, down again.
  const road = (i: number) => {
    const x0 = xs[i], y0 = ys[i], x1 = xs[i + 1], y1 = ys[i + 1];
    const ym = (y0 + y1) / 2;
    const sg = x1 > x0 ? 1 : -1;
    const r = Math.min(28, Math.abs(x1 - x0) / 2 - 1);
    return `M ${x0} ${y0} V ${ym - r} Q ${x0} ${ym} ${x0 + sg * r} ${ym} H ${x1 - sg * r} Q ${x1} ${ym} ${x1} ${ym + r} V ${y1}`;
  };
  // Finished stretches are green, the stretch to the lesson you are on is blue, what is ahead stays pale.
  const roadTone = (i: number) => {
    if (statuses[i] !== 'completed') return null;
    return statuses[i + 1] === 'completed' ? 'stroke-success' : 'stroke-brand';
  };

  return (
    <section aria-label={t('Your course lessons')} className={ui.panel}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-xl font-semibold tracking-tight text-ink">{t('Your roadmap')}</h2>
          <p className="m-0 mt-0.5 truncate text-sm text-ink-muted [unicode-bidi:plaintext]">{courseTitle ?? ''}</p>
        </div>
        <Link to={`/curriculum/${courseId}`} className="shrink-0 rounded text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {t('All chapters')}
        </Link>
      </div>

      <div className="mt-4 border-y border-line py-3">
        <p className="m-0 text-base font-semibold leading-snug text-ink [overflow-wrap:anywhere] [unicode-bidi:plaintext]">
          {t('Chapter {n}: {title}', { n: chapterNumber, title: chapter.title })}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-label={t('Chapter progress')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="lp-num whitespace-nowrap text-sm text-ink-muted">{t('{done}/{total} lessons', { done, total: lessons.length })}</span>
        </div>
        {chapterCount > 1 && <p className="m-0 mt-1.5 text-xs text-ink-muted">{t('Chapter {n} of {total}', { n: chapterNumber, total: chapterCount })}</p>}
      </div>

      <ol ref={listRef} className="relative m-0 mt-4 list-none p-0" role="list" style={{ height: H }}>
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" width={width} height={H}>
          {stops.slice(0, -1).map((_, i) => (
            <path key={`base-${i}`} d={road(i)} fill="none" strokeWidth={ROAD} strokeLinecap="round" className="stroke-surface-strong" />
          ))}
          {stops.slice(0, -1).map((_, i) => {
            const tone = roadTone(i);
            return tone ? <path key={`on-${i}`} d={road(i)} fill="none" strokeWidth={ROAD} strokeLinecap="round" className={tone} /> : null;
          })}
        </svg>
        {stops.map((stop, i) => {
          const status = stop.status;
          const isQuiz = stop.kind === 'quiz';
          const shape = isQuiz ? 'rounded-2xl' : 'rounded-full';
          const locked = status === 'locked';
          const current = status === 'current';
          const x = xs[i];
          const labelLeft = x > width / 2;
          const ring = status === 'completed' ? 'border-success' : current ? 'border-brand' : status === 'available' ? 'border-line-strong' : 'border-surface-strong';
          const tone = status === 'completed' ? 'text-success-ink' : current ? 'text-brand-ink' : 'text-ink-muted';
          const R = 34;
          const inner = (
            <>
              <span className={`relative shrink-0 ${current ? 'lp-pulse' : ''}`}>
                <span key={nudge?.key === stop.key ? nudge.n : 0} aria-hidden="true" className={`lp-node grid size-[68px] place-items-center ${shape} bg-surface ${tone} border-solid ${ring} ${nudge?.key === stop.key ? 'lp-shake' : ''}`} style={{ borderWidth: RING }}>
                  {status === 'completed' ? <CheckIcon className="size-6" /> : locked ? <LockIcon className="size-5" /> : isQuiz ? <ClipboardIcon className="size-6" /> : <span className="lp-num text-xl font-semibold">{stop.n}</span>}
                </span>
                {current && (
                  <span aria-hidden="true" className="absolute -bottom-1 -end-1 grid size-7 place-items-center rounded-full bg-brand text-white ring-2 ring-surface">
                    <svg viewBox="0 0 24 24" className="size-3.5 rtl:-scale-x-100" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z" /></svg>
                  </span>
                )}
              </span>
              <span className={`min-w-0 max-w-[11rem] ${labelLeft ? 'text-right' : 'text-left'}`}>
                <span className={`lp-num block text-base font-semibold leading-tight sm:text-xl ${tone}`}>{stop.label}</span>
                <span className={`mt-0.5 block text-sm leading-snug sm:text-base [overflow-wrap:anywhere] [unicode-bidi:plaintext] ${locked ? 'text-ink-muted' : 'text-ink'}`}>{stop.title}</span>
                {nudge?.key === stop.key && <span role="status" className="mt-1 block text-sm font-medium text-warning-ink">{nudge.text}</span>}
              </span>
            </>
          );
          const pos = labelLeft ? { right: width - x - R, left: undefined } : { left: x - R, right: undefined };
          // A flex row already runs right-to-left in Arabic, so the node/label order only needs reversing when the label's
  // physical side and the reading direction disagree.
  const row = `absolute top-0 flex h-[116px] items-center gap-4 ${labelLeft !== rtl ? 'flex-row-reverse' : ''}`;
          return (
            <li key={stop.key} role="listitem" aria-disabled={locked ? true : undefined} title={locked ? (isQuiz ? t('Complete every lesson in this chapter to unlock the quiz') : t('Complete the previous lesson first')) : undefined} className="relative h-[116px]">
              {locked ? (
                <button type="button" aria-disabled="true" onClick={() => explainLocked(i)} className={`${row} cursor-not-allowed rounded-full border-0 bg-transparent p-0 opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`} style={pos}>{inner}</button>
              ) : (
                <Link to={stop.to} state={isQuiz ? undefined : { courseId }} className={`${row} rounded-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`} style={pos}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
