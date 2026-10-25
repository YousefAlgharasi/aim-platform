import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { LessonNavigation } from './LessonNavigation';
import {
  fetchLessonAssets,
  fetchLessonDetail,
  fetchStudentLessons,
  type LessonAsset,
  type LessonDetail,
  type StudentLessonSummary,
} from './lessonsApi';
import styles from './LessonPlayer.module.css';

/** Navigation state accepted by /lessons/:lessonId and /practice/lesson/:lessonId. */
export interface LessonRouteState {
  courseId?: string;
  lessonTitle?: string;
}

export interface LessonPosition {
  /** Real per-student marker for this lesson (null when the chapter list couldn't load). */
  self: StudentLessonSummary | null;
  prev: StudentLessonSummary | null;
  next: StudentLessonSummary | null;
  /**
   * Mirrors the backend unlock gate (previous lesson must be completed):
   * a not-completed lesson positioned after the chapter's current lesson.
   */
  locked: boolean;
}

function computePosition(lessons: StudentLessonSummary[], lessonId: string): LessonPosition {
  const idx = lessons.findIndex(l => l.id === lessonId);
  if (idx < 0) return { self: null, prev: null, next: null, locked: false };
  const currentIdx = lessons.findIndex(l => l.current);
  const self = lessons[idx];
  return {
    self,
    prev: idx > 0 ? lessons[idx - 1] : null,
    next: idx + 1 < lessons.length ? lessons[idx + 1] : null,
    locked: !self.completed && !self.current && currentIdx >= 0 && idx > currentIdx,
  };
}

export function LessonPlayerShell() {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const location = useLocation();
  const navState = (location.state ?? {}) as LessonRouteState;
  const courseId = navState.courseId;

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [assets, setAssets] = useState<LessonAsset[]>([]);
  const [position, setPosition] = useState<LessonPosition>({ self: null, prev: null, next: null, locked: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([fetchLessonDetail(lessonId), fetchLessonAssets(lessonId)])
      .then(async ([detail, assetList]) => {
        setLesson(detail);
        setAssets(assetList);
        // Real completion/current markers come from the student chapter list,
        // exactly like Flutter's lesson detail page. Failure is non-fatal.
        try {
          const { lessons } = await fetchStudentLessons(detail.chapterId);
          setPosition(computePosition(lessons, detail.id));
        } catch {
          setPosition({ self: null, prev: null, next: null, locked: false });
        }
      })
      .catch((err) => setError(getErrorMessage(err, 'Failed to load lesson')))
      .finally(() => setLoading(false));
  }, [lessonId]);

  useEffect(() => { load(); }, [load]);

  const backTo = courseId ? `/curriculum/${courseId}` : '/curriculum';
  const backLabel = courseId ? '← Back to course' : '← Back to courses';

  if (loading) return <LoadingSpinner />;
  if (error || !lesson) {
    return <ErrorState message={error || 'Failed to load lesson'} onRetry={load} />;
  }

  const completed = position.self?.completed === true;
  const totalSeconds = assets.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0);
  const practiceState: LessonRouteState = { courseId, lessonTitle: lesson.title };

  return (
    <div className={styles.shell}>
      <div className={styles.topBar}>
        <Link to={backTo} className={styles.backLink}>{backLabel}</Link>
        <h1 className={styles.lessonTitle}>{lesson.title}</h1>
        {completed && <span className={styles.completedBadge}>✓ Completed</span>}
      </div>
      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: completed ? '100%' : '0%' }} />
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          {lesson.description && <p className={styles.heroDescription}>{lesson.description}</p>}
          <div className={styles.heroMeta}>
            <span>{assets.length} {assets.length === 1 ? 'step' : 'steps'}</span>
            {totalSeconds > 0 && <span>~{Math.max(1, Math.round(totalSeconds / 60))} min</span>}
            {lesson.xpValue > 0 && <span>{lesson.xpValue} XP</span>}
          </div>
        </div>

        {position.locked && (
          <Banner variant="warning">
            Complete the previous lesson before starting this one. You can read the content, but practice
            and progress are unlocked in order.
          </Banner>
        )}

        <h2 className={styles.sectionTitle}>What’s inside</h2>
        {assets.length === 0 ? (
          <EmptyState
            title="No content yet"
            message="This lesson doesn't have any published content steps yet. You can still practice its questions."
          />
        ) : (
          assets.map((asset, i) => <ContentBlockRenderer key={asset.id} asset={asset} stepNumber={i + 1} />)
        )}

        <Card>
          <div className={styles.practiceCard}>
            {completed ? (
              <>
                <h2 className={styles.sectionTitle}>Lesson mastered! 🌟</h2>
                <p className={styles.heroDescription}>
                  Reinforce your knowledge or practice with quick exercises.
                </p>
              </>
            ) : (
              <p className={styles.heroDescription}>
                Finish this lesson by completing its practice questions. Your answers are checked by AIM and
                the lesson is marked complete when you reach the end.
              </p>
            )}
            <div className={styles.practiceActions}>
              {position.locked ? (
                <span className={styles.lockedNote}>🔒 Practice unlocks after the previous lesson</span>
              ) : (
                <Link
                  to={`/practice/lesson/${lesson.id}`}
                  state={practiceState}
                  className={styles.primaryLink}
                >
                  {completed ? 'Practice again ⚡' : 'Start practice to complete lesson ⚡'}
                </Link>
              )}
              <Link
                to={`/ai-teacher?lessonId=${encodeURIComponent(lesson.id)}&lessonTitle=${encodeURIComponent(lesson.title)}`}
                className={styles.secondaryLink}
              >
                Ask AI tutor ✨
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.navBar}>
        <LessonNavigation position={position} courseId={courseId} />
      </div>
    </div>
  );
}
