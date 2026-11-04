import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
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
import { useI18n } from '../../i18n/I18nContext';
import { plural } from '../../i18n';
import { CheckIcon, SparkleIcon, ZapIcon } from '../../components/common/Icons';
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


  if (loading) return <LoadingSpinner />;
  if (error || !lesson) {
    return <ErrorState message={error || t('Failed to load lesson')} onRetry={load} />;
  }

  const completed = position.self?.completed === true;
  const totalSeconds = assets.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0);
  const practiceState: LessonRouteState = { courseId, lessonTitle: lesson.title };

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <BackButton fallback={courseId ? `/curriculum/${courseId}` : '/curriculum'} className="self-start" />

      <div className="bg-gradient-to-br from-brand via-brand to-secondary rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-brand/20 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-on-brand text-[11px] font-extrabold uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-full">
            {t('Lesson')}
          </span>
          {completed && (
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white bg-success px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckIcon className="size-3 text-white" /> {t('Completed')}
            </span>
          )}
        </div>
        <div className="flex items-start gap-2 mb-3">
          <h1 className="font-extrabold text-2xl sm:text-3xl tracking-tight m-0 leading-tight text-white">{lesson.title}</h1>
          {lesson.description && (
            <span className="mt-1.5 sm:mt-2">
              <InfoPopoverButton
                tone="onPrimary"
                title={t('About this lesson')}
                label={t('{title}: lesson description', { title: lesson.title })}
                text={lesson.description}
              />
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-on-brand">
          <span className="bg-black/20 px-2.5 py-1 rounded-full">{plural(assets.length, { one: t('1 step'), two: t('2 steps'), few: t('{n} steps', { n: assets.length }), other: t('{n} steps', { n: assets.length }) })}</span>
          {totalSeconds > 0 && <span className="bg-black/20 px-2.5 py-1 rounded-full">{t('~{n} min', { n: Math.max(1, Math.round(totalSeconds / 60)) })}</span>}
          {lesson.xpValue > 0 && <span className="bg-black/20 px-2.5 py-1 rounded-full">{t('{n} XP', { n: lesson.xpValue })}</span>}
        </div>
        <div className="h-2 bg-black/20 rounded-full overflow-hidden p-0.5 mt-4" aria-hidden="true">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: completed ? '100%' : '0%' }} />
        </div>
      </div>

      {position.locked && (
        <Banner variant="warning">
          {t('Complete the previous lesson before starting this one. You can read the content, but practice and progress are unlocked in order.')}
        </Banner>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-ink font-extrabold text-base tracking-tight m-0 px-1">{t('What’s inside')}</h2>
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
          <div className="px-1">
            <h2 className="text-ink font-extrabold text-base tracking-tight m-0">{t('Lesson mastered! 🌟')}</h2>
            <p className="text-ink-muted text-xs m-0 mt-0.5">
              {t('Reinforce your knowledge or practice with quick exercises.')}
            </p>
          </div>
        ) : (
          <p className="text-ink-muted text-sm leading-relaxed m-0 px-1">
            {t('Finish this lesson by completing its practice questions. Your answers are checked by AIM and the lesson is marked complete when you reach the end.')}
          </p>
        )}

        {position.locked ? (
          <span className="flex items-center justify-center h-[54px] rounded-2xl bg-control text-ink-muted text-sm font-semibold">
            {t('🔒 Practice unlocks after the previous lesson')}
          </span>
        ) : completed ? (
          <Link
            to={`/practice/lesson/${lesson.id}`}
            state={practiceState}
            className="w-full bg-gradient-to-r from-brand-soft to-secondary-soft dark:from-surface dark:to-brand-soft ring-2 ring-brand-ink rounded-2xl p-4 flex items-center gap-4 no-underline transition-all shadow-md shadow-brand/10"
          >
            <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-secondary text-white flex items-center justify-center shrink-0 shadow-md">
              <ZapIcon className="size-6 text-white" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-extrabold text-brand-ink text-base">{t('Practice again ⚡')}</span>
              <span className="block text-ink-soft text-xs mt-0.5">{t('Test your comprehension with quick interactive exercises.')}</span>
            </span>
          </Link>
        ) : (
          <Link
            to={`/practice/lesson/${lesson.id}`}
            state={practiceState}
            className="w-full h-[54px] rounded-2xl bg-gradient-to-r from-brand via-brand to-secondary text-white font-extrabold text-base no-underline shadow-lg shadow-brand/25 flex items-center justify-center gap-2.5 hover:opacity-95 transition-all"
          >
            {t('Start practice to complete lesson ⚡')}
          </Link>
        )}

        <Link
          to={`/ai-teacher?lessonId=${encodeURIComponent(lesson.id)}&lessonTitle=${encodeURIComponent(lesson.title)}`}
          className="w-full bg-surface ring-1 ring-line/80 hover:ring-brand-line rounded-2xl p-4 flex items-center gap-4 no-underline transition-all shadow-sm"
        >
          <span className="w-12 h-12 rounded-xl bg-secondary-soft text-secondary-ink flex items-center justify-center shrink-0">
            <SparkleIcon className="size-6" />
          </span>
          <span className="font-bold text-ink text-sm">{t('Ask AI tutor ✨')}</span>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-line-subtle">
        <LessonNavigation position={position} courseId={courseId} />
      </div>
    </div>
  );
}
