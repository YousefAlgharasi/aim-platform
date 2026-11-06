import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { InlineSkeleton } from '../../components/common/Skeleton';
import { fetchStudentLessons, type StudentLessonsResponse } from '../lessons/lessonsApi';
import type { FinalExamSummary, LevelWithChapters, StudentChapter } from './curriculumApi';
import { useI18n } from '../../i18n/I18nContext';
import { LockIcon } from './CurriculumIcons';
import { CheckIcon, TrophyIcon } from '../../components/common/Icons';
import { PathCharacter } from './PathCharacters';

type NodeStatus = 'completed' | 'current' | 'available' | 'locked';

/** Navigation state passed to the lesson player so it can link back to this course. */
export interface LessonNavState {
  courseId?: string;
}

interface PathItem {
  key: string;
  status: NodeStatus;
  kind: 'lesson' | 'quiz';
  /** 1-based position for lessons (shown inside the node). */
  number?: number;
  /** Small line above the title, e.g. "Lesson 3 · 10 XP". Empty for locked placeholders. */
  sub: string;
  title: string;
  to?: string;
  /** Tooltip for locked rows. */
  lockedHint?: string;
  /** Extra text for screen readers on locked rows. */
  srHint?: string;
}

// ---- Row -------------------------------------------------------------------------------

/** One stop on the path is a character, a title pill across its bottom edge, then stars (or a padlock). */
const ROW = 232;
const STOP_W = 168;
const CHAR = 104;
const ELBOW = 16;

/**
 * Width of an element, kept up to date, so the trail can be drawn in real pixels (rounded elbows stay round).
 * Returns a callback ref: the path only exists once the lessons have loaded, so a plain ref would miss it.
 */
function useWidth(): [number, (el: HTMLElement | null) => void] {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [w, setW] = useState(480);
  useEffect(() => {
    if (!el) return undefined;
    const read = () => setW(el.clientWidth || 480);
    read();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [w, setEl];
}

function StarGlyph({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-5 ${lit ? 'text-gold' : 'text-ink/25'}`} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z" />
    </svg>
  );
}

function pillTone(status: NodeStatus): string {
  switch (status) {
    case 'completed': return 'bg-success text-white';
    case 'current':
    case 'available': return 'bg-brand text-white';
    default: return 'bg-surface-strong text-ink-soft';
  }
}

interface PathRowProps {
  item: PathItem;
  index: number;
  /** Where the stop's centre sits, in pixels from the left edge of the path. */
  x: number;
  /** Bumped each time a locked stop is tapped, so it shakes again. */
  shake: number;
  onLocked: (item: PathItem) => void;
  courseId?: string;
}

function PathRow({ item, index, x, shake, onLocked, courseId }: PathRowProps) {
  const { t } = useI18n();
  const locked = item.status === 'locked';
  const current = item.status === 'current';
  const ref = useRef<HTMLLIElement>(null);

  // Bring the next lesson into view once, when the page is still at the top.
  useEffect(() => {
    if (current && window.scrollY < 50) ref.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }, [current]);

  const face = (
    <>
      {current && (
        <span aria-hidden="true" className="absolute inset-x-0 top-1 z-10 flex justify-center">
          <span className="lp-float relative block rounded-xl bg-brand px-3 py-1 text-sm font-semibold text-white">
            {t('Next')}
            <span className="absolute inset-x-0 -bottom-1 mx-auto size-2.5 rotate-45 bg-brand" />
          </span>
        </span>
      )}

      <span
        aria-hidden="true"
        className={`absolute rounded-full transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none ${current ? 'lp-pulse' : ''}`}
        style={{ top: 42, width: CHAR, height: CHAR, insetInlineStart: (STOP_W - CHAR) / 2 }}
      >
        <PathCharacter index={item.kind === 'quiz' ? 4 : index} grayscale={locked} className="size-full" />
      </span>

      <span className="absolute inset-x-0 flex justify-center px-1" style={{ top: 134 }}>
        <span className={`max-w-full rounded-2xl px-3.5 py-1.5 text-center text-sm font-semibold leading-tight [overflow-wrap:anywhere] [unicode-bidi:plaintext] ${pillTone(item.status)}`}>
          {item.title}
        </span>
      </span>

      <span aria-hidden="true" className="absolute inset-x-0 flex justify-center gap-1 text-ink-muted" style={{ top: 190 }}>
        {locked
          ? <LockIcon className="size-5" />
          : [0, 1, 2].map((n) => <StarGlyph key={n} lit={item.status === 'completed'} />)}
      </span>
    </>
  );

  return (
    <li
      ref={ref}
      role="listitem"
      data-status={item.status}
      aria-disabled={locked ? true : undefined}
      title={locked ? item.lockedHint : undefined}
      className="group absolute top-0"
      style={{ width: STOP_W, height: ROW, left: x - STOP_W / 2, top: index * ROW }}
    >
      {locked || !item.to ? (
        <button
          key={shake}
          type="button"
          aria-disabled="true"
          onClick={() => onLocked(item)}
          className={`absolute inset-0 cursor-not-allowed rounded-3xl border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${shake ? 'lp-shake' : ''}`}
        >
          {face}
        </button>
      ) : (
        <Link
          to={item.to}
          state={courseId ? ({ courseId } satisfies LessonNavState) : undefined}
          aria-label={item.title}
          className="absolute inset-0 rounded-3xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {face}
        </Link>
      )}
      <span className="sr-only">{item.sub}</span>
      {locked && item.srHint && <span className="sr-only">{item.srHint}</span>}
    </li>
  );
}

// ---- Chapter ---------------------------------------------------------------------------

interface ChapterPathProps {
  courseId: string;
  chapter: StudentChapter;
  number: number;
  locked: boolean;
}

function ChapterPath({ courseId, chapter, number, locked }: ChapterPathProps) {
  const { t } = useI18n();
  const isCompleted = chapter.status === 'completed';
  const [data, setData] = useState<StudentLessonsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchStudentLessons(chapter.chapterId)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, t('Failed to load lessons'))))
      .finally(() => setLoading(false));
  }, [chapter.chapterId, t]);

  // Every chapter loads its lessons: the whole course is always on the path. The lesson list is readable for locked chapters too; they show it all locked.
  useEffect(() => {
    if (!data && !loading && !error) load();
  }, [data, loading, error, load]);

  const statusText = locked
    ? t('Locked')
    : isCompleted
      ? t('Completed')
      : chapter.status === 'in_progress'
        ? t('In progress')
        : t('Not started');

  const lessonHint = t('Complete the previous lesson first');
  const items: PathItem[] = [];

  if (data) {
    const lessons = data.lessons ?? [];
    const currentIndex = lessons.findIndex((l) => l.current);
    lessons.forEach((lesson, i) => {
      const status: NodeStatus = locked
        ? 'locked'
        : lesson.completed
          ? 'completed'
          : lesson.current
            ? 'current'
            : currentIndex >= 0 && i > currentIndex
              ? 'locked'
              : 'available';
      items.push({
        key: lesson.id,
        status,
        kind: 'lesson',
        number: i + 1,
        sub: lesson.xpValue > 0
          ? `${t('Lesson {n}', { n: i + 1 })} · ${t('{n} XP', { n: lesson.xpValue })}`
          : t('Lesson {n}', { n: i + 1 }),
        title: lesson.title,
        to: `/lessons/${lesson.id}`,
        lockedHint: lessonHint,
      });
    });
    const quiz = data.quiz;
    if (quiz) {
      const quizLocked = locked || (quiz.locked && !quiz.completed);
      items.push({
        key: `quiz-${quiz.assessmentId}`,
        status: !locked && quiz.completed ? 'completed' : quizLocked ? 'locked' : 'available',
        kind: 'quiz',
        sub: t('Chapter quiz'),
        title: quiz.title,
        to: `/assessments/${quiz.assessmentId}`,
        lockedHint: t('Complete every lesson in this chapter to unlock the quiz'),
        srHint: t('Chapter quiz · finish all lessons to unlock'),
      });
    }
  } else if (locked) {
    // While the lessons load (or if they fail), a locked chapter still shows one placeholder per lesson.
    for (let i = 0; i < chapter.lessonCount; i += 1) {
      items.push({ key: `p${i}`, status: 'locked', kind: 'lesson', number: i + 1, sub: '', title: t('Lesson {n}', { n: i + 1 }), lockedHint: lessonHint });
    }
    if (chapter.quizCount > 0) {
      items.push({
        key: 'pq', status: 'locked', kind: 'quiz', sub: '', title: t('Chapter quiz'),
        lockedHint: t('Complete every lesson in this chapter to unlock the quiz'),
      });
    }
  }

  const labelTone = isCompleted ? 'text-success-ink' : locked ? 'text-ink-muted' : 'text-brand-ink';

  // The path zig-zags between a start lane and an end lane (physical coordinates, mirrored for right-to-left).
  const [width, listRef] = useWidth();
  const rtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const laneA = Math.max(STOP_W / 2, Math.round(width * 0.28));
  const laneB = width - laneA;
  const rows = items.length;
  const xs = items.map((_, i) => ((i % 2 === 0) !== rtl ? laneA : laneB));
  // Tapping a locked stop shakes it and says why it is locked.
  const [nudge, setNudge] = useState<{ key: string; text: string; n: number } | null>(null);
  const nudgeTimer = useRef<number | null>(null);
  useEffect(() => () => { if (nudgeTimer.current !== null) window.clearTimeout(nudgeTimer.current); }, []);
  const explainLocked = useCallback((item: PathItem) => {
    if (nudgeTimer.current !== null) window.clearTimeout(nudgeTimer.current);
    setNudge((cur) => ({ key: item.key, text: item.lockedHint ?? '', n: (cur?.n ?? 0) + 1 }));
    nudgeTimer.current = window.setTimeout(() => setNudge(null), 2600);
  }, []);

  // One piece of trail between two stops: down from under the stars, a rounded elbow across, down into the next character.
  const trail = items.slice(0, -1).map((item, i) => {
    const x0 = xs[i], x1 = xs[i + 1];
    const y0 = i * ROW + 218, y1 = (i + 1) * ROW + 38;
    const ym = (y0 + y1) / 2;
    const sg = x1 > x0 ? 1 : -1;
    const r = Math.max(0, Math.min(ELBOW, Math.abs(x1 - x0) / 2 - 1));
    const done = item.status === 'completed';
    const colour = done && items[i + 1].status === 'completed' ? 'stroke-success' : done ? 'stroke-brand' : 'stroke-ink/25';
    return { key: item.key, colour, d: `M ${x0} ${y0} V ${ym - r} Q ${x0} ${ym} ${x0 + sg * r} ${ym} H ${x1 - sg * r} Q ${x1} ${ym} ${x1} ${ym + r} V ${y1}` };
  });

  return (
    <section aria-label={chapter.title} className={`flex flex-col gap-1 ${locked ? 'opacity-80' : ''}`}>
      <header className="flex w-full flex-col items-center gap-2 px-2 py-3 text-center">
        <span className="flex w-full items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-line-strong" />
          <span className={`inline-flex items-center gap-2 text-sm font-semibold ${labelTone}`}>
            {t('Chapter {n}', { n: number })}
            {locked && <LockIcon className="size-4" />}
          </span>
          <span className="h-px flex-1 bg-line-strong" />
        </span>
        <h3
          aria-label={t('Chapter {n}: {title}', { n: number, title: chapter.title })}
          className={`m-0 text-xl font-semibold leading-snug tracking-tight [overflow-wrap:anywhere] [unicode-bidi:plaintext] ${locked ? 'text-ink-muted' : 'text-ink'}`}
        >
          {chapter.title}
        </h3>
        <span className="lp-num text-sm text-ink-muted">
          {chapter.completedLessonCount}/{chapter.lessonCount} · {statusText}
        </span>
      </header>

      <div className="py-2">
          {loading && <InlineSkeleton rows={4} />}
          {error && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-danger-soft p-3 text-sm text-danger-ink" role="alert">
              <span>{error}</span>
              <Button size="sm" variant="secondary" onClick={load}>{t('Retry')}</Button>
            </div>
          )}
          {data && items.length === 0 && (
            <p className="m-0 mb-3 text-center text-sm text-ink-muted">{t('No lessons published in this chapter yet.')}</p>
          )}
          {rows > 0 && (
            <div ref={listRef} className="relative mx-auto w-full max-w-[34rem]" style={{ height: rows * ROW }}>
              {width > 0 && rows > 1 && (
                <svg aria-hidden="true" className="pointer-events-none absolute inset-0" width={width} height={rows * ROW} viewBox={`0 0 ${width} ${rows * ROW}`}>
                  {trail.map((seg) => (
                    <path key={seg.key} d={seg.d} fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.01 11" className={seg.colour} />
                  ))}
                </svg>
              )}
              <ol className="m-0 list-none p-0" role="list">
                {width > 0 && items.map((item, i) => (
                  <PathRow key={item.key} item={item} index={i} x={xs[i]} shake={nudge?.key === item.key ? nudge.n : 0} onLocked={explainLocked} courseId={courseId} />
                ))}
              </ol>
            </div>
          )}
      </div>

      {nudge && (
        <div role="status" className="fixed bottom-24 start-1/2 z-40 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-center text-sm font-semibold text-ink-inverse rtl:translate-x-1/2 md:bottom-8">
          {nudge.text}
        </div>
      )}
    </section>
  );
}

// ---- Final exam ------------------------------------------------------------------------

function FinalExamCard({ exam }: { exam: FinalExamSummary }) {
  const { t } = useI18n();
  const unlocked = exam.unlocked || exam.passed === true;
  const face = exam.passed
    ? 'bg-success text-white'
    : unlocked
      ? 'bg-brand text-white'
      : 'bg-surface-strong text-ink-muted';
  const icon = exam.passed ? <CheckIcon className="size-7 text-white" /> : unlocked ? <TrophyIcon className="size-7" /> : <LockIcon className="size-6" />;
  const inner = (
    <>
      <span aria-hidden="true" className={`grid size-14 shrink-0 place-items-center rounded-full ${face}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-ink-muted">{t('Final exam')}</span>
        <span className="mt-0.5 block text-xl font-semibold leading-snug text-ink [unicode-bidi:plaintext]">{exam.title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
          {exam.passed
            ? exam.score != null
              ? t('Final exam completed and passed (score {score}).', { score: exam.score })
              : t('Final exam completed and passed.')
            : unlocked
              ? t('All chapters complete — the final exam is ready.')
              : t('Complete every chapter (lessons and quizzes) to unlock the final exam.')}
        </span>
      </span>
    </>
  );
  const cls = `flex items-center gap-4 rounded-2xl p-4 ring-1 ring-line sm:p-5 ${unlocked ? 'bg-surface-strong' : 'opacity-60'}`;
  return unlocked ? (
    <Link to={`/assessments/${exam.assessmentId}`} aria-label={exam.title} className={`${cls} no-underline transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none`}>{inner}</Link>
  ) : (
    <div aria-disabled="true" className={cls}>{inner}</div>
  );
}

// ---- List ------------------------------------------------------------------------------

interface ChapterLessonListProps {
  courseId: string;
  levels: LevelWithChapters[];
  finalExam: FinalExamSummary | null;
}

export function ChapterLessonList({ courseId, levels, finalExam }: ChapterLessonListProps) {
  // Same rule as Flutter's chapter list: a chapter is locked until the chapter
  // before it (in course order) is fully complete (backend-computed status,
  // which includes passing the chapter quiz). The backend independently
  // enforces the previous-lesson gate on progress/completion.
  const ordered = levels.flatMap((l) => l.chapters);
  const lockedById = new Map<string, boolean>();
  ordered.forEach((ch, i) => {
    const prevDone = i === 0 || ordered[i - 1].status === 'completed';
    lockedById.set(ch.chapterId, ch.status !== 'completed' && !prevDone);
  });

  let chapterNumber = 0;

  return (
    <div className="flex w-full flex-col gap-6">
      {levels.map(({ level, chapters }) => (
        <div key={level.id} className="flex flex-col gap-4" aria-label={level.title}>
          {levels.length > 1 && (
            <h2 className="m-0 mt-2 text-xl font-semibold tracking-tight text-ink">
              {level.code ? `${level.code} · ` : ''}{level.title}
            </h2>
          )}
          {chapters.map((chapter) => {
            chapterNumber += 1;
            return (
              <ChapterPath
                key={chapter.chapterId}
                courseId={courseId}
                chapter={chapter}
                number={chapterNumber}
                locked={!!lockedById.get(chapter.chapterId)}
              />
            );
          })}
        </div>
      ))}

      {finalExam && <FinalExamCard exam={finalExam} />}
    </div>
  );
}
