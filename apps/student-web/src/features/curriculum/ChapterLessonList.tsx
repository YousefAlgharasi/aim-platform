import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { InlineSkeleton } from '../../components/common/Skeleton';
import { fetchStudentLessons, type StudentLessonsResponse } from '../lessons/lessonsApi';
import type { FinalExamSummary, LevelWithChapters, StudentChapter } from './curriculumApi';
import { useI18n } from '../../i18n/I18nContext';
import { LockIcon } from './CurriculumIcons';
import { CheckIcon, TrophyIcon } from '../../components/common/Icons';
import { RoadMap, type RoadStop, type RowStatus } from '../roadmap/RoadMap';

/** Navigation state passed to the lesson player so it can link back to this course. */
export interface LessonNavState {
  courseId?: string;
}

// ---- Chapter ---------------------------------------------------------------------------

interface ChapterPathProps {
  courseId: string;
  chapter: StudentChapter;
  number: number;
  locked: boolean;
}

/** One chapter: its heading, then the same road as the dashboard's roadmap (no card around it). */
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

  // Every chapter loads its lessons: the whole course is always on the road. The lesson list is readable for locked chapters too; they show it all locked.
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

  const stops: RoadStop[] = [];

  if (data) {
    const lessons = data.lessons ?? [];
    const currentIndex = lessons.findIndex((l) => l.current);
    lessons.forEach((lesson, i) => {
      const status: RowStatus = locked
        ? 'locked'
        : lesson.completed
          ? 'completed'
          : lesson.current
            ? 'current'
            : currentIndex >= 0 && i > currentIndex
              ? 'locked'
              : 'available';
      stops.push({ key: lesson.id, kind: 'lesson', status, label: t('Lesson {n}', { n: i + 1 }), title: lesson.title, to: `/lessons/${lesson.id}`, n: i + 1 });
    });
    const quiz = data.quiz;
    if (quiz) {
      const quizLocked = locked || (quiz.locked && !quiz.completed);
      stops.push({
        key: `quiz-${quiz.assessmentId}`,
        kind: 'quiz',
        status: !locked && quiz.completed ? 'completed' : quizLocked ? 'locked' : 'current',
        label: t('Chapter quiz'),
        title: quiz.title,
        to: `/assessments/${quiz.assessmentId}`,
        n: lessons.length + 1,
      });
    }
  } else if (locked) {
    // While the lessons load (or if they fail), a locked chapter still shows one placeholder per lesson.
    for (let i = 0; i < chapter.lessonCount; i += 1) {
      stops.push({ key: `p${i}`, kind: 'lesson', status: 'locked', label: t('Lesson {n}', { n: i + 1 }), title: '', to: '', n: i + 1 });
    }
    if (chapter.quizCount > 0) {
      stops.push({ key: 'pq', kind: 'quiz', status: 'locked', label: t('Chapter quiz'), title: '', to: '', n: chapter.lessonCount + 1 });
    }
  }

  // Steps in the chapter = its lessons plus its quiz, so 3 lessons and a quiz read "x/4". The quiz counts once the lessons
  // have loaded (before that, the chapter's own quiz count); a finished chapter has passed its quiz.
  const quizSteps = data ? (data.quiz ? 1 : 0) : chapter.quizCount;
  const quizDone = data?.quiz ? data.quiz.completed : isCompleted && quizSteps > 0;
  const stepsTotal = chapter.lessonCount + quizSteps;
  const stepsDone = Math.min(stepsTotal, chapter.completedLessonCount + (quizDone ? 1 : 0));

  const labelTone = isCompleted ? 'text-success-ink' : locked ? 'text-ink-muted' : 'text-brand-ink';

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
          {stepsDone}/{stepsTotal} · {statusText}
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
        {data && stops.length === 0 && (
          <p className="m-0 mb-3 text-center text-sm text-ink-muted">{t('No lessons published in this chapter yet.')}</p>
        )}
        {stops.length > 0 && <RoadMap stops={stops} courseId={courseId} scrollToCurrent className="mx-auto w-full max-w-[34rem]" />}
      </div>
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
    <div data-tour="chapter-list" className="flex w-full flex-col gap-6">
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
