import { buttonClasses } from '../../components/common/buttonStyles';
import { useCallback, useEffect, useState } from 'react';
import { LevelBadge } from '../level/LevelBadge';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { LessonExplanationView } from './LessonExplanationView';
import { LessonNavigation } from './LessonNavigation';
import {
  fetchLessonAssets,
  fetchLessonDetail,
  fetchStudentLessons,
  type LessonAsset,
  type LessonDetail,
  type StudentLessonSummary,
} from './lessonsApi';
import { useI18n } from '../../i18n/I18nContext';
import { plural } from '../../i18n';
import { CheckIcon } from '../../components/common/Icons';
import { LockIcon } from '../curriculum/CurriculumIcons';
import { InfoPopoverButton } from '../../components/common/InfoPopoverButton';
import { BackButton } from '../../components/common/BackButton';

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
function ChevronGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 text-ink-muted rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
  );
}

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


  if (loading) return <DetailSkeleton />;
  if (error || !lesson) {
    return <ErrorState message={error || t('Failed to load lesson')} onRetry={load} />;
  }

  const completed = position.self?.completed === true;
  const totalSeconds = assets.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0);
  const practiceState: LessonRouteState = { courseId, lessonTitle: lesson.title };

  return (
    <div className="flex w-full flex-col gap-8">
      <BackButton fallback={courseId ? `/curriculum/${courseId}` : '/curriculum'} className="self-start" />

      <header className="border-t border-line pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <LevelBadge showName={false} />
          {completed && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-success-ink">
              <CheckIcon className="size-4" /> {t('Completed')}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-start gap-2">
          <h1 className="lp-display m-0 text-[2rem] font-semibold text-ink [unicode-bidi:plaintext] sm:text-[2.75rem]">{lesson.title}</h1>
          {lesson.description && (
            <span className="mt-2 sm:mt-3">
              <InfoPopoverButton
                title={t('About this lesson')}
                label={t('{title}: lesson description', { title: lesson.title })}
                text={lesson.description}
              />
            </span>
          )}
        </div>
        <p className="m-0 mt-3 text-base text-ink-muted">
          {[
            plural(assets.length, { one: t('1 step'), two: t('2 steps'), few: t('{n} steps', { n: assets.length }), other: t('{n} steps', { n: assets.length }) }),
            totalSeconds > 0 ? t('~{n} min', { n: Math.max(1, Math.round(totalSeconds / 60)) }) : null,
            lesson.xpValue > 0 ? t('{n} XP', { n: lesson.xpValue }) : null,
          ].filter(Boolean).join(', ')}
        </p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
          <div className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-success' : 'bg-brand'}`} style={{ width: completed ? '100%' : '0%' }} />
        </div>
      </header>

      {position.locked && (
        <Banner variant="warning">
          {t('Complete the previous lesson before starting this one. You can read the content, but practice and progress are unlocked in order.')}
        </Banner>
      )}

      {lesson.explanation && <LessonExplanationView explanation={lesson.explanation} />}

      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-semibold tracking-tight text-ink">
          {lesson.explanation ? t('Practice material') : t('What’s inside')}
        </h2>
        {assets.length === 0 ? (
          <EmptyState
            title={t('No content yet')}
            message={t("This lesson doesn't have any published content steps yet. You can still practice its questions.")}
          />
        ) : (
          assets.map((asset, i) => <ContentBlockRenderer key={asset.id} asset={asset} stepNumber={i + 1} />)
        )}
      </div>

      <div className="flex flex-col gap-3">
        {completed ? (
          <div>
            <h2 className="m-0 text-xl font-semibold tracking-tight text-ink">{t('Lesson mastered')}</h2>
            <p className="m-0 mt-1 text-base text-ink-muted">
              {t('Reinforce your knowledge or practice with quick exercises.')}
            </p>
          </div>
        ) : (
          <p className="m-0 text-base leading-relaxed text-ink-muted">
            {t('Finish this lesson by completing its practice questions. Your answers are checked by AIM and the lesson is marked complete when you reach the end.')}
          </p>
        )}

        {position.locked ? (
          <span className="flex h-14 items-center justify-center gap-2 rounded-full bg-surface-strong text-sm font-semibold text-ink-muted">
            <LockIcon className="size-4" />{t('Practice unlocks after the previous lesson')}
          </span>
        ) : (
          // One button for both states, in the same place and style: only the label changes once the lesson is done.
          <Link
            to={`/practice/lesson/${lesson.id}`}
            state={practiceState}
            className={buttonClasses('primary', 'lg', true)}
          >
            {completed ? t('Practice again') : t('Start practice to complete lesson')}
          </Link>
        )}

        <Link
          to={`/ai-teacher?lessonId=${encodeURIComponent(lesson.id)}&lessonTitle=${encodeURIComponent(lesson.title)}`}
          className="flex w-full items-center gap-4 rounded-2xl bg-surface p-4 no-underline ring-1 ring-line transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span className="min-w-0 flex-1 text-lg font-semibold text-ink">{t('Ask AI tutor')}</span>
          <ChevronGlyph />
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
        <LessonNavigation position={position} courseId={courseId} />
      </div>
    </div>
  );
}
