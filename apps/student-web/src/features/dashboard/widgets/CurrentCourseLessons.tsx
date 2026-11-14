import { useEffect, useState } from 'react';
import * as ui from './ui';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { RoadMap, type RoadStop, type RowStatus } from '../../roadmap/RoadMap';
import {
  fetchCourseLevels,
  fetchStudentChapters,
  fetchStudentCourses,
  type FinalExamSummary,
  type StudentChapter,
  type StudentCourse,
} from '../../curriculum/curriculumApi';
import { fetchStudentLessons, type ChapterQuizSummary, type StudentLessonSummary } from '../../lessons/lessonsApi';

export type { RowStatus };

export interface CurrentChapter {
  chapter: StudentChapter;
  chapterNumber: number;
  chapterCount: number;
  lessons: StudentLessonSummary[];
  /** The chapter's quiz, when it has one: the last stop on the roadmap. */
  quiz?: ChapterQuizSummary | null;
}

/** What the dashboard shows once every chapter is done: the course, its final exam (if any) and what to start next. */
export interface FinishedCourse {
  course: StudentCourse;
  finalExam: FinalExamSummary | null;
  nextCourse: StudentCourse | null;
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
export function useCurrentChapter(
  courseId: string | null,
  knownCourses?: StudentCourse[] | null,
): { state: 'idle' | 'loading' | 'hidden' | 'ready' | 'finished'; chapter: CurrentChapter | null; finished: FinishedCourse | null } {
  const [state, setState] = useState<'idle' | 'loading' | 'hidden' | 'ready' | 'finished'>(courseId ? 'loading' : 'idle');
  const [chapter, setChapter] = useState<CurrentChapter | null>(null);
  const [finished, setFinished] = useState<FinishedCourse | null>(null);

  useEffect(() => {
    if (!courseId) { setState('idle'); setChapter(null); setFinished(null); return undefined; }
    let cancelled = false;
    setState('loading');
    (async () => {
      const courses = knownCourses && knownCourses.length > 0 ? knownCourses : await fetchStudentCourses();
      const course = courses.find((c) => c.courseId === courseId);
      if (!course || course.locked) return null;

      const levels = await fetchCourseLevels(courseId);
      const perLevel = await Promise.all(levels.map((l) => fetchStudentChapters(l.id)));
      const ordered = perLevel.flatMap((r) => r.chapters);
      const isLocked = (i: number) => ordered[i].status !== 'completed' && i > 0 && ordered[i - 1].status !== 'completed';
      let idx = ordered.findIndex((ch, i) => ch.status === 'in_progress' && !isLocked(i));
      if (idx < 0) idx = ordered.findIndex((ch, i) => ch.status !== 'completed' && !isLocked(i));
      if (idx < 0) {
        // Every chapter is done: say so, instead of leaving the card empty.
        if (ordered.length === 0 || !ordered.every((ch) => ch.status === 'completed')) return null;
        const exams = perLevel.map((r) => r.finalExam).filter((e): e is FinalExamSummary => !!e);
        const nextCourse = courses.find((c) => c.next && c.courseId !== courseId) ?? null;
        return { finished: { course, finalExam: exams[exams.length - 1] ?? null, nextCourse } };
      }

      const { lessons, quiz } = await fetchStudentLessons(ordered[idx].chapterId);
      if (lessons.length === 0) return null;
      return { chapter: { chapter: ordered[idx], chapterNumber: idx + 1, chapterCount: ordered.length, lessons, quiz } as CurrentChapter };
    })()
      .then((result) => {
        if (cancelled) return;
        const done = result && 'finished' in result ? result.finished : null;
        const current = result && 'chapter' in result ? result.chapter : null;
        setChapter(current ?? null);
        setFinished(done ?? null);
        setState(done ? 'finished' : current ? 'ready' : 'hidden');
      })
      .catch(() => !cancelled && setState('hidden'));
    return () => { cancelled = true; };
  }, [courseId, knownCourses]);

  return { state, chapter, finished };
}

/** The current chapter's lessons, on Home: the same road as the course page, for one chapter. */
export function CurrentCourseLessons({ courseId, data }: { courseId: string; courseTitle?: string | null; data: CurrentChapter }) {
  const { t } = useI18n();
  const { chapter, chapterNumber, chapterCount, lessons, quiz } = data;
  const lessonStates = lessonStatuses(lessons);
  const done = lessons.filter((l) => l.completed).length;
  // Every stop on the road: the lessons in order, then the chapter quiz (open once every lesson is done).
  const stops: RoadStop[] = lessons.map((l, i) => ({ key: l.id, kind: 'lesson', status: lessonStates[i], label: t('Lesson {n}', { n: i + 1 }), title: l.title, to: `/lessons/${l.id}`, n: i + 1 }));
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

  return (
    <section data-tour="course-lessons" aria-label={t('Your course lessons')} className={ui.panel}>
      <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <h2 className="m-0 text-base font-semibold leading-snug text-ink [overflow-wrap:anywhere] [unicode-bidi:plaintext]">
            {t('Chapter {n}: {title}', { n: chapterNumber, title: chapter.title })}
          </h2>
          <p className="lp-num m-0 mt-1.5 text-sm text-ink-muted">{t('{done}/{total} lessons', { done, total: lessons.length })}</p>
          {chapterCount > 1 && <p className="m-0 mt-1 text-xs text-ink-muted">{t('Chapter {n} of {total}', { n: chapterNumber, total: chapterCount })}</p>}
        </div>
        <Link to={`/curriculum/${courseId}`} className="shrink-0 rounded text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {t('All chapters')}
        </Link>
      </div>

      <RoadMap stops={stops} courseId={courseId} />
    </section>
  );
}
