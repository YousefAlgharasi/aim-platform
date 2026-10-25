import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { fetchStudentLessons, type StudentLessonsResponse } from '../lessons/lessonsApi';
import type { FinalExamSummary, LevelWithChapters, StudentChapter } from './curriculumApi';
import { ChevronDownIcon, ChevronRightIcon, LockIcon } from './CurriculumIcons';
import { CheckIcon, ClipboardIcon } from '../../components/common/Icons';

type LessonStatus = 'completed' | 'current' | 'available' | 'locked';

/** Navigation state passed to the lesson player so it can link back to this course. */
export interface LessonNavState {
  courseId?: string;
}

const ROW_BASE =
  'w-full flex items-center gap-3 rounded-2xl p-3 ring-1 transition-all duration-200 text-start no-underline';
const ROW_ACTIVE =
  'bg-white dark:bg-slate-800 ring-slate-200/80 dark:ring-slate-700 hover:ring-indigo-200 dark:hover:ring-indigo-700';
const ROW_CURRENT =
  'bg-indigo-50/30 dark:bg-indigo-950/30 ring-2 ring-[#4F46E5] dark:ring-indigo-400 shadow-md';
const ROW_LOCKED = 'bg-white dark:bg-slate-800 ring-slate-200/60 dark:ring-slate-800 opacity-65 cursor-not-allowed';

function statusPill(status: LessonStatus) {
  const base = 'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold';
  switch (status) {
    case 'completed': return `${base} bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400`;
    case 'current': return `${base} bg-indigo-600 text-white shadow-md shadow-indigo-500/20`;
    case 'locked': return `${base} bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500`;
    default: return `${base} bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400`;
  }
}

function StatusGlyph({ status }: { status: LessonStatus }) {
  switch (status) {
    case 'completed': return <CheckIcon className="size-5 text-emerald-600 dark:text-emerald-400" />;
    case 'locked': return <LockIcon className="size-4" />;
    case 'current': return <span aria-hidden="true">▶</span>;
    default: return <span aria-hidden="true">○</span>;
  }
}

function Pill({ tone, children }: { tone: 'done' | 'current' | 'muted'; children: React.ReactNode }) {
  const cls =
    tone === 'done'
      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
      : tone === 'current'
        ? 'text-white bg-indigo-600'
        : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700';
  return (
    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${cls}`}>
      {children}
    </span>
  );
}

const CARD = 'bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-[#E2E8F0] dark:ring-slate-700 shadow-sm';

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
  const ordered = levels.flatMap(l => l.chapters);
  const lockedById = new Map<string, boolean>();
  ordered.forEach((ch, i) => {
    const prevDone = i === 0 || ordered[i - 1].status === 'completed';
    lockedById.set(ch.chapterId, ch.status !== 'completed' && !prevDone);
  });
  const autoExpandId =
    ordered.find(ch => ch.status === 'in_progress')?.chapterId ??
    ordered.find(ch => ch.status !== 'completed' && !lockedById.get(ch.chapterId))?.chapterId;

  let chapterNumber = 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center px-1">
        <span className="text-slate-900 dark:text-white font-extrabold text-base tracking-tight">Course Chapters</span>
        <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">{ordered.length} Chapters</span>
      </div>
      {levels.map(({ level, chapters }) => (
        <section key={level.id} className="flex flex-col gap-3" aria-label={level.title}>
          {levels.length > 1 && (
            <h2 className="text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider m-0 mt-2 px-1">
              {level.code ? `${level.code} · ` : ''}{level.title}
            </h2>
          )}
          {chapters.map(chapter => {
            chapterNumber += 1;
            return (
              <ChapterCard
                key={chapter.chapterId}
                courseId={courseId}
                chapter={chapter}
                number={chapterNumber}
                locked={!!lockedById.get(chapter.chapterId)}
                defaultExpanded={chapter.chapterId === autoExpandId}
              />
            );
          })}
        </section>
      ))}

      {finalExam && <FinalExamCard exam={finalExam} />}
    </div>
  );
}

interface ChapterCardProps {
  courseId: string;
  chapter: StudentChapter;
  number: number;
  locked: boolean;
  defaultExpanded: boolean;
}

function ChapterCard({ courseId, chapter, number, locked, defaultExpanded }: ChapterCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded && !locked);
  const [data, setData] = useState<StudentLessonsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchStudentLessons(chapter.chapterId)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load lessons')))
      .finally(() => setLoading(false));
  }, [chapter.chapterId]);

  useEffect(() => {
    if (expanded && !data && !loading && !error) load();
  }, [expanded, data, loading, error, load]);

  const statusText = locked
    ? 'Locked'
    : chapter.status === 'completed'
      ? 'Completed'
      : chapter.status === 'in_progress'
        ? 'In progress'
        : 'Not started';

  const lessons = data?.lessons ?? [];
  const currentIndex = lessons.findIndex(l => l.current);
  const isCompleted = chapter.status === 'completed';

  const badgeCls = isCompleted
    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
    : locked
      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
      : 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400';

  return (
    <div className={`${CARD} p-4 sm:p-5 ${locked ? 'opacity-65' : ''}`}>
      <div
        role="button"
        tabIndex={0}
        className="flex items-start gap-4 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        onClick={() => setExpanded(v => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(v => !v);
          }
        }}
        aria-expanded={expanded}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-base ${badgeCls}`}>
          {isCompleted ? <CheckIcon className="size-6 text-white" /> : locked ? <LockIcon className="size-5" /> : <span>Ch.{number}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-base m-0 leading-tight">
              Chapter {number}: {chapter.title}
            </h3>
            <ChevronDownIcon className={`size-4 text-slate-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
          {chapter.description && (
            <p className="text-slate-400 dark:text-slate-500 text-xs m-0 mb-3 leading-relaxed line-clamp-2">{chapter.description}</p>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden" aria-hidden="true">
              <div
                className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                style={{ width: `${chapter.percent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {chapter.completedLessonCount}/{chapter.lessonCount} · {statusText}
            </span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4">
          {loading && <LoadingSpinner />}
          {error && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm p-3" role="alert">
              <span>{error}</span>
              <Button size="sm" variant="secondary" onClick={load}>Retry</Button>
            </div>
          )}
          {data && lessons.length === 0 && (
            <p className="text-slate-400 dark:text-slate-500 text-sm m-0">No lessons published in this chapter yet.</p>
          )}
          {data && lessons.length > 0 && (
            <div className="flex flex-col gap-2" role="list">
              {lessons.map((lesson, i) => {
                const status: LessonStatus = lesson.completed
                  ? 'completed'
                  : locked
                    ? 'locked'
                    : lesson.current
                      ? 'current'
                      : currentIndex >= 0 && i > currentIndex
                        ? 'locked'
                        : 'available';
                const content = (
                  <>
                    <span className={statusPill(status)} aria-hidden="true">
                      <StatusGlyph status={status} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Lesson {i + 1}
                      </span>
                      <span className="block font-bold text-slate-900 dark:text-white text-sm leading-snug">{lesson.title}</span>
                      {lesson.xpValue > 0 && (
                        <span className="block text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{lesson.xpValue} XP</span>
                      )}
                    </div>
                    {status === 'completed' && <Pill tone="done">Done</Pill>}
                    {status === 'current' && <Pill tone="current">Current</Pill>}
                    {status !== 'locked' && <ChevronRightIcon className="size-4 text-slate-400 dark:text-slate-500 shrink-0 rtl:rotate-180" />}
                  </>
                );

                if (status === 'locked') {
                  return (
                    <div
                      key={lesson.id}
                      className={`${ROW_BASE} ${ROW_LOCKED}`}
                      role="listitem"
                      aria-disabled="true"
                      title="Complete the previous lesson first"
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <Link
                    key={lesson.id}
                    to={`/lessons/${lesson.id}`}
                    state={{ courseId } satisfies LessonNavState}
                    className={`${ROW_BASE} ${status === 'current' ? ROW_CURRENT : ROW_ACTIVE}`}
                    role="listitem"
                  >
                    {content}
                  </Link>
                );
              })}

              {data.quiz && (
                data.quiz.locked && !data.quiz.completed ? (
                  <div
                    className={`${ROW_BASE} ${ROW_LOCKED}`}
                    role="listitem"
                    aria-disabled="true"
                    title="Complete every lesson in this chapter to unlock the quiz"
                  >
                    <span className={statusPill('locked')} aria-hidden="true"><LockIcon className="size-4" /></span>
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-slate-900 dark:text-white text-sm leading-snug">{data.quiz.title}</span>
                      <span className="block text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">Chapter quiz · finish all lessons to unlock</span>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/assessments/${data.quiz.assessmentId}`}
                    className={`${ROW_BASE} ${ROW_ACTIVE}`}
                    role="listitem"
                  >
                    <span className={statusPill(data.quiz.completed ? 'completed' : 'current')} aria-hidden="true">
                      {data.quiz.completed ? <CheckIcon className="size-5 text-emerald-600 dark:text-emerald-400" /> : <ClipboardIcon className="size-5" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-slate-900 dark:text-white text-sm leading-snug">{data.quiz.title}</span>
                      <span className="block text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">Chapter quiz</span>
                    </div>
                    {data.quiz.completed && <Pill tone="done">Passed</Pill>}
                    <ChevronRightIcon className="size-4 text-slate-400 dark:text-slate-500 shrink-0 rtl:rotate-180" />
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FinalExamCard({ exam }: { exam: FinalExamSummary }) {
  const unlocked = exam.unlocked || exam.passed === true;
  const body = (
    <div className="flex items-start gap-4">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          exam.passed
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
            : unlocked
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
        }`}
      >
        {exam.passed ? <CheckIcon className="size-6 text-white" /> : unlocked ? <ClipboardIcon className="size-5" /> : <LockIcon className="size-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-slate-900 dark:text-white text-base m-0 leading-tight">{exam.title}</h3>
          {exam.passed && <Pill tone="done">Passed</Pill>}
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs m-0 leading-relaxed">
          {exam.passed
            ? `Final exam completed and passed${exam.score != null ? ` (score ${exam.score})` : ''}.`
            : unlocked
              ? 'All chapters complete — the final exam is ready.'
              : 'Complete every chapter (lessons and quizzes) to unlock the final exam.'}
        </p>
      </div>
    </div>
  );

  return unlocked ? (
    <Link
      to={`/assessments/${exam.assessmentId}`}
      className={`${CARD} block p-4 sm:p-5 no-underline hover:ring-indigo-300 dark:hover:ring-indigo-700 hover:shadow-md transition-all`}
    >
      {body}
    </Link>
  ) : (
    <div aria-disabled="true" className={`${CARD} p-4 sm:p-5 opacity-65 cursor-not-allowed`}>{body}</div>
  );
}
