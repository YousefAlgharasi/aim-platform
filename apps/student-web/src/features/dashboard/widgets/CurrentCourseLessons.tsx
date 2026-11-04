import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { Card } from '../../../components/common/Card';
import { CheckIcon } from '../../../components/common/Icons';
import { ChevronRightIcon, LockIcon } from '../../curriculum/CurriculumIcons';
import {
  fetchCourseLevels,
  fetchStudentChapters,
  fetchStudentCourses,
  type StudentChapter,
} from '../../curriculum/curriculumApi';
import { fetchStudentLessons, type StudentLessonSummary } from '../../lessons/lessonsApi';

type RowStatus = 'completed' | 'current' | 'available' | 'locked';

interface Loaded {
  chapter: StudentChapter;
  chapterNumber: number;
  lessons: StudentLessonSummary[];
}

/**
 * Lessons of the active chapter of the student's current course, straight on Home. It applies the same
 * lock rules as the course page (a chapter opens once the one before it is complete; later lessons open
 * after the current one) and never bypasses the backend gates. If the course is locked or unpaid, or any
 * request is denied or fails, the section is simply not shown.
 */
export function CurrentCourseLessons({ courseId, courseTitle }: { courseId: string; courseTitle: string | null }) {
  const { t } = useI18n();
  const [state, setState] = useState<'loading' | 'hidden' | 'ready'>('loading');
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    (async () => {
      const courses = await fetchStudentCourses();
      const course = courses.find((c) => c.courseId === courseId);
      if (!course || course.locked) return null;

      const levels = await fetchCourseLevels(courseId);
      const perLevel = await Promise.all(levels.map((l) => fetchStudentChapters(l.id)));
      const ordered = perLevel.flatMap((r) => r.chapters);
      // Same rule as the course page: locked until the previous chapter is complete.
      const isLocked = (i: number) => ordered[i].status !== 'completed' && i > 0 && ordered[i - 1].status !== 'completed';
      let idx = ordered.findIndex((ch, i) => ch.status === 'in_progress' && !isLocked(i));
      if (idx < 0) idx = ordered.findIndex((ch, i) => ch.status !== 'completed' && !isLocked(i));
      if (idx < 0) return null;

      const { lessons } = await fetchStudentLessons(ordered[idx].chapterId);
      if (lessons.length === 0) return null;
      return { chapter: ordered[idx], chapterNumber: idx + 1, lessons };
    })()
      .then((result) => {
        if (cancelled) return;
        setLoaded(result);
        setState(result ? 'ready' : 'hidden');
      })
      .catch(() => !cancelled && setState('hidden'));
    return () => { cancelled = true; };
  }, [courseId]);

  if (state === 'hidden') return null;
  if (state === 'loading' || !loaded) {
    return (
      <Card>
        <div className="h-24 animate-pulse rounded-xl bg-surface-muted" role="status" aria-label={t('Loading')} />
      </Card>
    );
  }

  const { chapter, chapterNumber, lessons } = loaded;
  const currentIndex = lessons.findIndex((l) => l.current);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-base font-extrabold tracking-tight text-ink">{t('Your course lessons')}</h2>
          <p className="m-0 mt-0.5 text-xs font-medium text-ink-muted break-words">
            {courseTitle ? `${courseTitle} · ` : ''}{t('Chapter {n}: {title}', { n: chapterNumber, title: chapter.title })}
          </p>
        </div>
        <Link
          to={`/curriculum/${courseId}`}
          className="shrink-0 text-xs font-bold text-brand-ink no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
        >
          {t('All chapters')}
        </Link>
      </div>

      <div className="mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto" role="list">
        {lessons.map((lesson, i) => {
          const status: RowStatus = lesson.completed
            ? 'completed'
            : lesson.current
              ? 'current'
              : currentIndex >= 0 && i > currentIndex
                ? 'locked'
                : 'available';
          const body = (
            <>
              <span
                aria-hidden="true"
                className={`size-9 shrink-0 rounded-xl flex items-center justify-center font-extrabold ${
                  status === 'completed' ? 'bg-success-soft text-success-ink'
                    : status === 'current' ? 'bg-brand text-white'
                      : 'bg-surface-muted text-ink-muted'
                }`}
              >
                {status === 'completed' ? <CheckIcon className="size-4 text-success-ink" />
                  : status === 'locked' ? <LockIcon className="size-4" />
                    : <span>{i + 1}</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold leading-snug text-ink break-words">{lesson.title}</span>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted rtl:normal-case rtl:tracking-normal">
                  {status === 'completed' ? t('Done') : status === 'current' ? t('Current') : status === 'locked' ? t('Locked') : t('Lesson {n}', { n: i + 1 })}
                </span>
              </span>
              {status !== 'locked' && <ChevronRightIcon className="size-4 shrink-0 text-ink-muted rtl:rotate-180" />}
            </>
          );
          const base = 'flex items-center gap-3 rounded-2xl p-2.5 ring-1 text-start no-underline';
          if (status === 'locked') {
            return (
              <div key={lesson.id} role="listitem" aria-disabled="true" title={t('Complete the previous lesson first')} className={`${base} !bg-surface-sunken ring-line cursor-not-allowed`}>
                {body}
              </div>
            );
          }
          return (
            <div key={lesson.id} role="listitem">
            <Link
              to={`/lessons/${lesson.id}`}
              state={{ courseId }}
              className={`${base} transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                status === 'current' ? 'bg-brand-soft/30 ring-2 ring-brand-ink' : 'bg-surface ring-line hover:ring-brand-line'
              }`}
            >
              {body}
            </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
