import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { InlineSkeleton } from '../../components/common/Skeleton';
import { fetchStudentLessons, type StudentLessonsResponse } from '../lessons/lessonsApi';
import type { FinalExamSummary, LevelWithChapters, StudentChapter } from './curriculumApi';
import { useI18n } from '../../i18n/I18nContext';
import { ChevronDownIcon, LockIcon } from './CurriculumIcons';
import { CheckIcon, ClipboardIcon, TrophyIcon } from '../../components/common/Icons';

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

function nodeTone(status: NodeStatus): string {
  switch (status) {
    case 'completed': return 'bg-success text-white shadow-md shadow-success/25';
    case 'current': return 'bg-brand text-white shadow-lg shadow-brand/40 ring-4 ring-brand/20';
    case 'available': return 'bg-brand-soft text-brand-ink ring-2 ring-brand-line';
    default: return 'bg-surface-muted text-ink-muted ring-1 ring-line';
  }
}

function cardTone(status: NodeStatus): string {
  switch (status) {
    case 'completed': return 'bg-success-soft ring-1 ring-success-line';
    case 'current': return 'bg-brand-soft ring-2 ring-brand shadow-card-hover';
    case 'available': return 'bg-surface ring-1 ring-line hover:ring-brand-line';
    default: return 'bg-surface-sunken ring-1 ring-line-subtle';
  }
}

function PlayGlyph() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

function Node({ item }: { item: PathItem }) {
  const radius = item.kind === 'quiz' ? 'rounded-xl' : 'rounded-full';
  return (
    <span aria-hidden="true" className={`relative z-10 grid size-10 shrink-0 place-items-center text-sm font-extrabold ${radius} ${nodeTone(item.status)}`}>
      {item.status === 'current' && <span className={`absolute inset-0 ${radius} bg-brand/30 motion-safe:animate-ping motion-reduce:hidden`} />}
      <span className="relative grid place-items-center">
        {item.status === 'completed' ? <CheckIcon className="size-5 text-white" />
          : item.status === 'current' ? <PlayGlyph />
            : item.status === 'locked' ? <LockIcon className="size-4" />
              : item.kind === 'quiz' ? <ClipboardIcon className="size-5" />
                : item.number}
      </span>
    </span>
  );
}

/** One lesson/quiz: a node on the rail and a card. Open rows are links; locked ones are inert. */
function PathRow({ item, last, courseId }: { item: PathItem; last: boolean; courseId?: string }) {
  const { t } = useI18n();
  const locked = item.status === 'locked';
  const ref = useRef<HTMLLIElement>(null);

  // Bring the next lesson into view once, when the page is still at the top.
  useEffect(() => {
    if (item.status === 'current' && window.scrollY < 50) ref.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }, [item.status]);

  const body = (
    <>
      <span className="min-w-0 flex-1">
        {item.sub && <span className="block text-xs font-semibold text-ink-muted">{item.sub}</span>}
        <span className={`block text-[15px] font-bold leading-snug [overflow-wrap:anywhere] [unicode-bidi:plaintext] ${locked ? 'text-ink-muted' : 'text-ink'}`}>{item.title}</span>
      </span>
      {item.status === 'current' && (
        <span className="shrink-0 rounded-full bg-brand px-2.5 py-1 text-[11px] font-extrabold text-white">{t('Next')}</span>
      )}
      {(item.status === 'available' || item.status === 'completed') && (
        <span aria-hidden="true" className="shrink-0 text-ink-muted rtl:-scale-x-100">→</span>
      )}
    </>
  );
  const cls = `flex min-h-14 flex-1 items-center gap-3 rounded-2xl px-4 py-3 ${cardTone(item.status)}`;

  return (
    <li
      ref={ref}
      role="listitem"
      aria-disabled={locked ? true : undefined}
      title={locked ? item.lockedHint : undefined}
      className="flex gap-3"
    >
      <div className="flex w-10 shrink-0 flex-col items-center">
        <Node item={item} />
        {!last && <span aria-hidden="true" className={`my-1 w-0.5 flex-1 rounded-full ${item.status === 'completed' ? 'bg-success/60' : 'bg-line'}`} />}
      </div>
      <div className="flex min-w-0 flex-1 pb-3">
        {locked || !item.to ? (
          <div className={cls}>{body}</div>
        ) : (
          <Link
            to={item.to}
            state={courseId ? ({ courseId } satisfies LessonNavState) : undefined}
            aria-label={item.title}
            className={`${cls} no-underline transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none`}
          >
            {body}
          </Link>
        )}
        <span className="sr-only">{item.sub}</span>
        {locked && item.srHint && <span className="sr-only">{item.srHint}</span>}
      </div>
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
  // Finished and locked chapters fold away so the path starts at what you still have to do.
  const [open, setOpen] = useState(!isCompleted && !locked);
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

  // Open, unlocked chapters load their lessons; locked ones show placeholders and never fetch.
  useEffect(() => {
    if (!locked && open && !data && !loading && !error) load();
  }, [locked, open, data, loading, error, load]);

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
      items.push({ key: `p${i}`, status: 'locked', kind: 'lesson', number: i + 1, sub: '', title: t('Lesson {n}', { n: i + 1 }), lockedHint: lessonHint });
    }
    if (chapter.quizCount > 0) {
      items.push({
        key: 'pq', status: 'locked', kind: 'quiz', sub: '', title: t('Chapter quiz'),
        lockedHint: t('Complete every lesson in this chapter to unlock the quiz'),
      });
    }
  } else if (data) {
    const lessons = data.lessons ?? [];
    const currentIndex = lessons.findIndex((l) => l.current);
    lessons.forEach((lesson, i) => {
      const status: NodeStatus = lesson.completed
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
      const quizLocked = quiz.locked && !quiz.completed;
      items.push({
        key: `quiz-${quiz.assessmentId}`,
        status: quiz.completed ? 'completed' : quizLocked ? 'locked' : 'available',
        kind: 'quiz',
        sub: t('Chapter quiz'),
        title: quiz.title,
        to: `/assessments/${quiz.assessmentId}`,
        lockedHint: t('Complete every lesson in this chapter to unlock the quiz'),
        srHint: t('Chapter quiz · finish all lessons to unlock'),
      });
    }
  }

  const tone = isCompleted ? 'ring-success-line' : locked ? 'ring-line-subtle' : 'ring-line';

  return (
    <section aria-label={chapter.title} className={`rounded-3xl bg-surface shadow-card ring-1 ${tone} ${locked ? 'opacity-80' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-4 rounded-3xl border-0 bg-transparent p-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:p-5"
      >
        <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-2xl text-base font-extrabold ${isCompleted ? 'bg-success text-white' : locked ? 'bg-surface-muted text-ink-muted' : 'bg-brand-soft text-brand-ink'}`}>
          {isCompleted ? <CheckIcon className="size-5 text-white" /> : locked ? <LockIcon className="size-4" /> : number}
        </span>
        <span className="min-w-0 flex-1">
          <h3 className="m-0 text-base font-extrabold leading-snug tracking-tight text-ink [overflow-wrap:anywhere]">
            {t('Chapter {n}: {title}', { n: number, title: chapter.title })}
          </h3>
          <span className="mt-2 flex items-center gap-3">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-strong" aria-hidden="true">
              <span className={`block h-full rounded-full ${isCompleted ? 'bg-success' : 'bg-brand'}`} style={{ width: `${chapter.percent}%` }} />
            </span>
            <span className="whitespace-nowrap text-xs font-bold tabular-nums text-ink-muted">
              {chapter.completedLessonCount}/{chapter.lessonCount} · {statusText}
            </span>
          </span>
        </span>
        <ChevronDownIcon className={`size-5 shrink-0 text-ink-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-2 sm:px-5">
          {loading && <InlineSkeleton rows={4} />}
          {error && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-danger-soft p-3 text-sm text-danger-ink" role="alert">
              <span>{error}</span>
              <Button size="sm" variant="secondary" onClick={load}>{t('Retry')}</Button>
            </div>
          )}
          {!locked && data && items.length === 0 && (
            <p className="m-0 mb-3 text-center text-sm text-ink-muted">{t('No lessons published in this chapter yet.')}</p>
          )}
          {items.length > 0 && (
            <ol className="m-0 list-none p-0" role="list">
              {items.map((item, i) => <PathRow key={item.key} item={item} last={i === items.length - 1} courseId={courseId} />)}
            </ol>
          )}
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
    ? 'bg-success text-white shadow-lg shadow-success/25'
    : unlocked
      ? 'bg-brand text-white shadow-lg shadow-brand/40 ring-4 ring-brand/20'
      : 'bg-surface-muted text-ink-muted ring-1 ring-line';
  const icon = exam.passed ? <CheckIcon className="size-7 text-white" /> : unlocked ? <TrophyIcon className="size-7" /> : <LockIcon className="size-6" />;
  const inner = (
    <>
      <span aria-hidden="true" className={`grid size-14 shrink-0 place-items-center rounded-2xl ${face}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-extrabold uppercase tracking-wider text-ink-muted rtl:normal-case rtl:tracking-normal">{t('Final exam')}</span>
        <span className="mt-0.5 block text-base font-extrabold leading-snug text-ink [unicode-bidi:plaintext]">{exam.title}</span>
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
  const cls = `flex items-center gap-4 rounded-3xl p-4 shadow-card ring-1 sm:p-5 ${unlocked ? 'bg-brand-soft ring-brand-line' : 'bg-surface-sunken ring-line-subtle'}`;
  return unlocked ? (
    <Link to={`/assessments/${exam.assessmentId}`} aria-label={exam.title} className={`${cls} no-underline transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none`}>{inner}</Link>
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {levels.map(({ level, chapters }) => (
        <div key={level.id} className="flex flex-col gap-4" aria-label={level.title}>
          {levels.length > 1 && (
            <h2 className="m-0 mt-2 px-1 text-xs font-extrabold uppercase tracking-wider text-brand-ink rtl:normal-case rtl:tracking-normal">
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
