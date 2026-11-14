import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { LessonPlayer } from './player/LessonPlayer';
import { LessonStart } from './LessonStart';
import { pickGuide } from './dialogue/guide';
import {
  fetchLessonAssets,
  fetchLessonDetail,
  fetchStudentLessons,
  type LessonAsset,
  type LessonDetail,
  type StudentLessonSummary,
} from './lessonsApi';
import { useI18n } from '../../i18n/I18nContext';

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

/** Small right-pointing chevron for link rows (flips in right-to-left). */
export function LessonPlayerShell() {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const location = useLocation();
  const navState = (location.state ?? {}) as LessonRouteState;
  const { t } = useI18n();
  const courseId = navState.courseId;

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [assets, setAssets] = useState<LessonAsset[]>([]);
  const [position, setPosition] = useState<LessonPosition>({ self: null, prev: null, next: null, locked: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Opening a lesson shows the two ways to learn it first; 'read' is the step-by-step reading player.
  const [view, setView] = useState<'start' | 'read'>('start');

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
      .catch((err) => setError(getErrorMessage(err, t('Failed to load lesson'))))
      .finally(() => setLoading(false));
  }, [lessonId, t]);

  useEffect(() => { load(); }, [load]);
  // A different lesson (same page, new id) starts at the start screen again.
  useEffect(() => { setView('start'); }, [lessonId]);


  if (loading) return <DetailSkeleton />;
  if (error || !lesson) {
    return <ErrorState message={error || t('Failed to load lesson')} onRetry={load} />;
  }

  const completed = position.self?.completed === true;
  const practiceState: LessonRouteState = { courseId, lessonTitle: lesson.title };

  if (view === 'start') {
    return (
      <LessonStart
        lessonId={lesson.id}
        title={lesson.title}
        guide={pickGuide(lesson.id)}
        completed={completed}
        locked={position.locked}
        courseId={courseId}
        onRead={() => setView('read')}
      />
    );
  }

  return (
    <LessonPlayer
      lesson={lesson}
      assets={assets}
      position={position}
      completed={completed}
      courseId={courseId}
      practiceState={practiceState}
      onBackToStart={() => setView('start')}
    />
  );
}
