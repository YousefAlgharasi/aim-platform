import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { fetchStudentLessons, type StudentLessonsResponse } from '../lessons/lessonsApi';
import type { FinalExamSummary, LevelWithChapters, StudentChapter } from './curriculumApi';
import styles from './CourseDetail.module.css';

type LessonStatus = 'completed' | 'current' | 'available' | 'locked';

/** Navigation state passed to the lesson player so it can link back to this course. */
export interface LessonNavState {
  courseId?: string;
}

function getIconClass(status: LessonStatus) {
  switch (status) {
    case 'completed': return styles.iconCompleted;
    case 'current': return styles.iconCurrent;
    case 'locked': return styles.iconLocked;
    default: return styles.iconDefault;
  }
}

function getIconSymbol(status: LessonStatus) {
  switch (status) {
    case 'completed': return '✓';
    case 'current': return '▶';
    case 'locked': return '🔒';
    default: return '○';
  }
}

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
    <div className={styles.chapterList}>
      {levels.map(({ level, chapters }) => (
        <section key={level.id} className={styles.levelSection} aria-label={level.title}>
          {levels.length > 1 && (
            <h2 className={styles.levelTitle}>
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

  return (
    <Card>
      <div className={styles.chapterCard}>
        <div
          role="button"
          tabIndex={0}
          className={styles.chapterToggle}
          onClick={() => setExpanded(v => !v)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded(v => !v);
            }
          }}
          aria-expanded={expanded}
        >
          <div className={styles.chapterHeader}>
            <h3 className={styles.chapterTitle}>
              {locked && <span aria-hidden="true">🔒 </span>}
              Chapter {number}: {chapter.title}
            </h3>
            <span className={styles.chapterProgress}>
              {chapter.completedLessonCount}/{chapter.lessonCount} · {statusText}
            </span>
          </div>
          {chapter.description && <p className={styles.chapterDesc}>{chapter.description}</p>}
          <div className={styles.progressBar} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${chapter.percent}%` }} />
          </div>
        </div>

        {expanded && (
          <>
            {loading && <LoadingSpinner />}
            {error && (
              <div className={styles.inlineError}>
                <span>{error}</span>
                <Button size="sm" variant="secondary" onClick={load}>Retry</Button>
              </div>
            )}
            {data && lessons.length === 0 && (
              <p className={styles.chapterDesc}>No lessons published in this chapter yet.</p>
            )}
            {data && lessons.length > 0 && (
              <div className={styles.lessonList} role="list">
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
                      <span className={`${styles.lessonIcon} ${getIconClass(status)}`} aria-hidden="true">
                        {getIconSymbol(status)}
                      </span>
                      <div className={styles.lessonInfo}>
                        <span className={styles.lessonName}>{lesson.title}</span>
                        {lesson.xpValue > 0 && <span className={styles.lessonDuration}>{lesson.xpValue} XP</span>}
                      </div>
                      {status === 'completed' && (
                        <span className={`${styles.statusBadge} ${styles.badgeCompleted}`}>Done</span>
                      )}
                      {status === 'current' && (
                        <span className={`${styles.statusBadge} ${styles.badgeCurrent}`}>Current</span>
                      )}
                    </>
                  );

                  if (status === 'locked') {
                    return (
                      <div
                        key={lesson.id}
                        className={`${styles.lessonItem} ${styles.lessonLocked}`}
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
                      className={styles.lessonItem}
                      role="listitem"
                    >
                      {content}
                    </Link>
                  );
                })}

                {data.quiz && (
                  data.quiz.locked && !data.quiz.completed ? (
                    <div
                      className={`${styles.lessonItem} ${styles.lessonLocked}`}
                      role="listitem"
                      aria-disabled="true"
                      title="Complete every lesson in this chapter to unlock the quiz"
                    >
                      <span className={`${styles.lessonIcon} ${styles.iconLocked}`} aria-hidden="true">🔒</span>
                      <div className={styles.lessonInfo}>
                        <span className={styles.lessonName}>{data.quiz.title}</span>
                        <span className={styles.lessonDuration}>Chapter quiz · finish all lessons to unlock</span>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={`/assessments/${data.quiz.assessmentId}`}
                      className={styles.lessonItem}
                      role="listitem"
                    >
                      <span
                        className={`${styles.lessonIcon} ${data.quiz.completed ? styles.iconCompleted : styles.iconCurrent}`}
                        aria-hidden="true"
                      >
                        {data.quiz.completed ? '✓' : '?'}
                      </span>
                      <div className={styles.lessonInfo}>
                        <span className={styles.lessonName}>{data.quiz.title}</span>
                        <span className={styles.lessonDuration}>Chapter quiz</span>
                      </div>
                      {data.quiz.completed && (
                        <span className={`${styles.statusBadge} ${styles.badgeCompleted}`}>Passed</span>
                      )}
                    </Link>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

function FinalExamCard({ exam }: { exam: FinalExamSummary }) {
  const unlocked = exam.unlocked || exam.passed === true;
  const body = (
    <div className={styles.chapterCard}>
      <div className={styles.chapterHeader}>
        <h3 className={styles.chapterTitle}>
          {!unlocked && <span aria-hidden="true">🔒 </span>}
          {exam.title}
        </h3>
        {exam.passed && <span className={`${styles.statusBadge} ${styles.badgeCompleted}`}>Passed</span>}
      </div>
      <p className={styles.chapterDesc}>
        {exam.passed
          ? `Final exam completed and passed${exam.score != null ? ` (score ${exam.score})` : ''}.`
          : unlocked
            ? 'All chapters complete — the final exam is ready.'
            : 'Complete every chapter (lessons and quizzes) to unlock the final exam.'}
      </p>
    </div>
  );

  return (
    <Card>
      {unlocked ? (
        <Link to={`/assessments/${exam.assessmentId}`} className={styles.plainLink}>{body}</Link>
      ) : (
        <div aria-disabled="true" className={styles.lessonLockedSoft}>{body}</div>
      )}
    </Card>
  );
}
