import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { ListSkeleton } from '../../components/common/Skeleton';
import { fetchStudentLessons, type StudentLessonsResponse } from '../lessons/lessonsApi';
import type { FinalExamSummary, LevelWithChapters, StudentChapter } from './curriculumApi';
import { useI18n } from '../../i18n/I18nContext';
import { LockIcon } from './CurriculumIcons';
import {
  BookIcon,
  ChatIcon,
  CheckIcon,
  ClipboardIcon,
  LightbulbIcon,
  MicIcon,
  PencilIcon,
  TrophyIcon,
} from '../../components/common/Icons';

type NodeStatus = 'completed' | 'current' | 'available' | 'locked';

/** Navigation state passed to the lesson player so it can link back to this course. */
export interface LessonNavState {
  courseId?: string;
}

// ---- Winding path geometry -------------------------------------------------------------
// One row per node. The node circle sits NODE_TOP below the row's top (room for the "Next" bubble
// on the current node); the caption sits beside the node (on the side the path is leaning away from) so the dotted line never crosses it.
const ROW_H = 176;
const NODE_TOP = 28;
const NODE_SIZE = 72;
const CENTER_Y = NODE_TOP + NODE_SIZE / 2;
/** Horizontal wobble, in percent of the half-width, cycled down the path. */
const OFFSETS = [-40, 40];
/** Decorative glyphs for lessons that are open but not the current one. */
const GLYPHS = [BookIcon, PencilIcon, ChatIcon, MicIcon, LightbulbIcon];

const xPercent = (i: number) => 50 + OFFSETS[i % OFFSETS.length] / 2;

interface PathItem {
  key: string;
  status: NodeStatus;
  shape: 'round' | 'square';
  glyph: React.ReactNode;
  /** Small line above the title, e.g. "Lesson 3 · 10 XP". */
  sub: string;
  title: string;
  to?: string;
  state?: LessonNavState;
  /** Tooltip for locked nodes. */
  lockedHint?: string;
  /** Extra text for screen readers on locked nodes. */
  srHint?: string;
}

const NODE_BASE =
  'relative flex items-center justify-center shrink-0 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus';

function nodeTone(status: NodeStatus): string {
  switch (status) {
    case 'completed': return 'bg-success text-white shadow-md shadow-success/25';
    case 'current': return 'bg-gradient-to-br from-brand to-secondary text-white shadow-[0_10px_28px_-6px_rgb(71_98_238/0.6)] ring-4 ring-brand-soft';
    case 'available': return 'bg-brand-soft text-brand-ink ring-2 ring-brand-line';
    default: return 'bg-surface-muted text-ink-muted ring-1 ring-line opacity-60';
  }
}

function pillTone(status: NodeStatus): string {
  switch (status) {
    case 'completed': return 'bg-success text-white';
    case 'current': return 'bg-brand text-white';
    case 'available': return 'bg-brand-soft text-brand-ink';
    default: return 'bg-surface-strong text-ink-muted';
  }
}

function PlayGlyph() {
  return (
    <svg className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

/** One round (or soft-square) node with its caption. Open nodes are links; locked ones are inert. */
function PathNodeView({ item, courseId }: { item: PathItem; courseId?: string }) {
  const { t } = useI18n();
  const locked = item.status === 'locked';
  const radius = item.shape === 'square' ? 'rounded-[1.4rem]' : 'rounded-full';
  const circle = `${NODE_BASE} ${radius} ${nodeTone(item.status)}`;
  const inner = (
    <>
      {item.status === 'current' && (
        <span aria-hidden="true" className={`absolute inset-0 ${radius} bg-brand/30 motion-safe:animate-ping motion-reduce:hidden`} />
      )}
      <span className="relative flex items-center justify-center" aria-hidden="true">
        {item.status === 'completed' ? <CheckIcon className="size-8 text-white" />
          : item.status === 'current' ? <PlayGlyph />
            : item.status === 'locked' ? <LockIcon className="size-6" />
              : item.glyph}
      </span>
    </>
  );

  return (
    <>
      <div className="h-7 flex items-end justify-center pb-1">
        {item.status === 'current' && (
          <span className="rounded-full bg-surface ring-1 ring-brand-line px-2.5 py-0.5 text-[11px] font-extrabold text-brand-ink shadow-sm">
            {t('Next')}
          </span>
        )}
      </div>
      {locked || !item.to ? (
        <div className={circle} style={{ width: NODE_SIZE, height: NODE_SIZE }}>{inner}</div>
      ) : (
        <Link
          to={item.to}
          state={courseId ? ({ courseId } satisfies LessonNavState) : undefined}
          aria-label={item.title}
          className={`${circle} no-underline hover:scale-105 active:scale-95 motion-reduce:transition-none`}
          style={{ width: NODE_SIZE, height: NODE_SIZE }}
        >
          {inner}
        </Link>
      )}
      <div className={`mt-2 w-max max-w-[10rem] rounded-full px-4 py-1 text-center text-[13px] font-bold leading-5 break-words line-clamp-2 shadow-sm ${pillTone(item.status)}`}>
        {item.title}
      </div>
      <span className="sr-only">{item.sub}</span>
      {locked && item.srHint && <span className="sr-only">{item.srHint}</span>}
    </>
  );
}

/** Nodes laid out along a sine-like track, joined by dotted curves. Mirrors itself in RTL. */
/** Width of [ref] in px, kept up to date (the dotted turns are drawn in real pixels so their corners stay round). */
function useWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setW(el.clientWidth);
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** Radius of the rounded right-angle turns. */
const TURN_R = 18;
/** Where the horizontal run sits inside a row: just under the title pill. */
const RUN_Y = 160;

function WindingPath({ items, courseId }: { items: PathItem[]; courseId?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const width = useWidth(boxRef);
  const n = items.length;
  if (n === 0) return null;
  const height = n * ROW_H;
  const segments = width === 0 ? [] : items.slice(0, -1).map((item, i) => {
    const x1 = (width * xPercent(i)) / 100;
    const x2 = (width * xPercent(i + 1)) / 100;
    const dir = x2 >= x1 ? 1 : -1;
    const yRun = i * ROW_H + RUN_Y;
    // Stop above the "Next" bubble when the next node is the current one, so the line never runs behind it.
    const yEnd = (i + 1) * ROW_H + (items[i + 1].status === 'current' ? 0 : NODE_TOP - 4);
    const tone = item.status === 'completed'
      ? (items[i + 1].status === 'completed' ? 'text-success' : 'text-brand')
      : 'text-line-strong';
    // Out from under the title pill, straight across, round corner, straight down into the next node.
    const d = `M ${x1} ${yRun} H ${x2 - dir * TURN_R} Q ${x2} ${yRun} ${x2} ${yRun + TURN_R} V ${yEnd}`;
    return { d, tone, key: item.key };
  });

  return (
    <div ref={boxRef} className="relative w-full" style={{ height: height + 24 }} role="list">
      <svg
        className="absolute inset-x-0 top-0 overflow-visible rtl:-scale-x-100"
        width={width}
        height={height}
        viewBox={`0 0 ${width || 1} ${height}`}
        aria-hidden="true"
      >
        {segments.map((s) => (
          <path
            key={s.key}
            d={s.d}
            className={s.tone}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0 12"
          />
        ))}
      </svg>
      {items.map((item, i) => (
        <div
          key={item.key}
          role="listitem"
          aria-disabled={item.status === 'locked' ? true : undefined}
          title={item.status === 'locked' ? item.lockedHint : undefined}
          className="absolute flex flex-col items-center -translate-x-1/2 rtl:translate-x-1/2"
          style={{ top: i * ROW_H, height: ROW_H, width: NODE_SIZE, insetInlineStart: `${xPercent(i)}%` }}
        >
          <PathNodeView item={item} courseId={courseId} />
        </div>
      ))}
    </div>
  );
}

// ---- Chapter list ----------------------------------------------------------------------

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
  const { t } = useI18n();
  const ordered = levels.flatMap(l => l.chapters);
  const lockedById = new Map<string, boolean>();
  ordered.forEach((ch, i) => {
    const prevDone = i === 0 || ordered[i - 1].status === 'completed';
    lockedById.set(ch.chapterId, ch.status !== 'completed' && !prevDone);
  });

  let chapterNumber = 0;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-2">
      {levels.map(({ level, chapters }) => (
        <div key={level.id} className="flex flex-col gap-2" aria-label={level.title}>
          {levels.length > 1 && (
            <h2 className="text-brand-ink text-xs font-extrabold uppercase tracking-wider m-0 mt-2 px-1">
              {level.code ? `${level.code} · ` : ''}{level.title}
            </h2>
          )}
          {chapters.map(chapter => {
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

      {finalExam && <FinalExamNode exam={finalExam} />}
    </div>
  );
}

interface ChapterPathProps {
  courseId: string;
  chapter: StudentChapter;
  number: number;
  locked: boolean;
}

function ChapterPath({ courseId, chapter, number, locked }: ChapterPathProps) {
  const { t } = useI18n();
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

  // Unlocked chapters load their lessons right away; locked ones show placeholders and never fetch.
  useEffect(() => {
    if (!locked && !data && !loading && !error) load();
  }, [locked, data, loading, error, load]);

  const isCompleted = chapter.status === 'completed';
  const statusText = locked
    ? t('Locked')
    : isCompleted
      ? t('Completed')
      : chapter.status === 'in_progress'
        ? t('In progress')
        : t('Not started');

  const lessonHint = t('Complete the previous lesson first');
  const items: PathItem[] = [];

  if (locked) {
    for (let i = 0; i < chapter.lessonCount; i += 1) {
      items.push({
        key: `p${i}`,
        status: 'locked',
        shape: 'round',
        glyph: null,
        sub: '',
        title: t('Lesson {n}', { n: i + 1 }),
        lockedHint: lessonHint,
      });
    }
    if (chapter.quizCount > 0) {
      items.push({
        key: 'pq',
        status: 'locked',
        shape: 'square',
        glyph: null,
        sub: t('Chapter quiz'),
        title: t('Chapter quiz'),
        lockedHint: t('Complete every lesson in this chapter to unlock the quiz'),
      });
    }
  } else if (data) {
    const lessons = data.lessons ?? [];
    const currentIndex = lessons.findIndex(l => l.current);
    lessons.forEach((lesson, i) => {
      const status: NodeStatus = lesson.completed
        ? 'completed'
        : lesson.current
          ? 'current'
          : currentIndex >= 0 && i > currentIndex
            ? 'locked'
            : 'available';
      const Glyph = GLYPHS[i % GLYPHS.length];
      items.push({
        key: lesson.id,
        status,
        shape: 'round',
        glyph: <Glyph className="size-7" />,
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
      const quizLocked = quiz.locked && !quiz.completed;
      items.push({
        key: `quiz-${quiz.assessmentId}`,
        status: quiz.completed ? 'completed' : quizLocked ? 'locked' : 'available',
        shape: 'square',
        glyph: <ClipboardIcon className="size-7" />,
        sub: t('Chapter quiz'),
        title: quiz.title,
        to: `/assessments/${quiz.assessmentId}`,
        lockedHint: t('Complete every lesson in this chapter to unlock the quiz'),
        srHint: t('Chapter quiz · finish all lessons to unlock'),
      });
    }
  }

  return (
    <section aria-label={chapter.title} className="flex flex-col">
      {/* Chapter separator: a divider with a centred pill. */}
      <div className="flex items-center gap-3 mt-4 mb-1">
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        <div
          className={`max-w-[17rem] shrink rounded-2xl px-4 py-2 text-center ring-1 ${
            isCompleted ? 'bg-success-soft ring-success-line' : locked ? 'bg-surface-sunken ring-line' : 'bg-surface ring-brand-line'
          }`}
        >
          <h3 className="m-0 text-sm font-extrabold leading-tight text-ink break-words">
            {t('Chapter {n}: {title}', { n: number, title: chapter.title })}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-strong" aria-hidden="true">
              <div
                className={`h-full rounded-full ${isCompleted ? 'bg-success' : 'bg-gradient-to-r rtl:bg-gradient-to-l from-brand to-secondary'}`}
                style={{ width: `${chapter.percent}%` }}
              />
            </div>
            <span className="whitespace-nowrap text-[11px] font-bold text-ink-muted">
              {chapter.completedLessonCount}/{chapter.lessonCount} · {statusText}
            </span>
          </div>
        </div>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>

      {loading && <ListSkeleton rows={4} bare />}
      {error && (
        <div className="my-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-danger-soft text-danger-ink text-sm p-3" role="alert">
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={load}>{t('Retry')}</Button>
        </div>
      )}
      {!locked && data && items.length === 0 && (
        <p className="text-ink-muted text-sm text-center m-0 my-3">{t('No lessons published in this chapter yet.')}</p>
      )}
      {items.length > 0 && <WindingPath items={items} courseId={courseId} />}
    </section>
  );
}

function FinalExamNode({ exam }: { exam: FinalExamSummary }) {
  const { t } = useI18n();
  const unlocked = exam.unlocked || exam.passed === true;
  const tone = exam.passed
    ? 'bg-success text-white shadow-lg shadow-success/25'
    : unlocked
      ? 'bg-gradient-to-br from-brand to-secondary text-white shadow-lg shadow-brand/30 ring-4 ring-brand-soft'
      : 'bg-surface-muted text-ink-muted ring-1 ring-line';
  const circle = `${NODE_BASE} size-24 rounded-full ${tone}`;
  const glyph = exam.passed ? <CheckIcon className="size-10 text-white" /> : unlocked ? <TrophyIcon className="size-10" /> : <LockIcon className="size-8" />;

  return (
    <div className="mt-6 flex flex-col items-center gap-2 text-center">
      <div className="flex items-center gap-3 w-full">
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        <span className="text-xs font-extrabold uppercase tracking-wider rtl:normal-case rtl:tracking-normal text-ink-muted">{t('Final exam')}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>
      {unlocked ? (
        <Link
          to={`/assessments/${exam.assessmentId}`}
          aria-label={exam.title}
          className={`${circle} no-underline hover:scale-105 active:scale-95 motion-reduce:transition-none`}
        >
          <span aria-hidden="true">{glyph}</span>
        </Link>
      ) : (
        <div aria-disabled="true" className={circle}><span aria-hidden="true">{glyph}</span></div>
      )}
      <h3 className="m-0 text-base font-extrabold leading-tight text-ink">{exam.title}</h3>
      <p className="m-0 max-w-[18rem] text-xs leading-relaxed text-ink-muted">
        {exam.passed
          ? exam.score != null
            ? t('Final exam completed and passed (score {score}).', { score: exam.score })
            : t('Final exam completed and passed.')
          : unlocked
            ? t('All chapters complete — the final exam is ready.')
            : t('Complete every chapter (lessons and quizzes) to unlock the final exam.')}
      </p>
    </div>
  );
}
