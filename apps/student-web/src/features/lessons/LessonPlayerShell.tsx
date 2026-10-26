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
import { BackArrowIcon } from '../curriculum/CurriculumIcons';
import { CheckIcon, SparkleIcon, ZapIcon } from '../../components/common/Icons';

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

  const backTo = courseId ? `/curriculum/${courseId}` : '/curriculum';
  const backLabel = courseId ? t('Back to course') : t('Back to courses');

  if (loading) return <LoadingSpinner />;
  if (error || !lesson) {
    return <ErrorState message={error || t('Failed to load lesson')} onRetry={load} />;
  }

  const completed = position.self?.completed === true;
  const totalSeconds = assets.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0);
  const practiceState: LessonRouteState = { courseId, lessonTitle: lesson.title };

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Link
          to={backTo}
          aria-label={backLabel}
          title={backLabel}
          className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center transition-colors shrink-0"
        >
          <BackArrowIcon />
        </Link>
        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight">{backLabel}</span>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-indigo-100 text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
            {t('Lesson')}
          </span>
          {completed && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
              <CheckIcon className="size-3 text-emerald-300" /> {t('Completed')}
            </span>
          )}
        </div>
        <h1 className="font-extrabold text-2xl sm:text-3xl tracking-tight m-0 leading-tight mb-2 text-white">{lesson.title}</h1>
        {lesson.description && <p className="text-indigo-100/90 text-sm m-0 leading-relaxed mb-3">{lesson.description}</p>}
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-indigo-100">
          <span className="bg-white/15 px-2.5 py-1 rounded-full">{plural(assets.length, { one: t('1 step'), two: t('2 steps'), few: t('{n} steps', { n: assets.length }), other: t('{n} steps', { n: assets.length }) })}</span>
          {totalSeconds > 0 && <span className="bg-white/15 px-2.5 py-1 rounded-full">{t('~{n} min', { n: Math.max(1, Math.round(totalSeconds / 60)) })}</span>}
          {lesson.xpValue > 0 && <span className="bg-white/15 px-2.5 py-1 rounded-full">{t('{n} XP', { n: lesson.xpValue })}</span>}
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
        <h2 className="text-slate-900 dark:text-white font-extrabold text-base tracking-tight m-0 px-1">{t('What’s inside')}</h2>
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
            <h2 className="text-slate-900 dark:text-white font-extrabold text-base tracking-tight m-0">{t('Lesson mastered! 🌟')}</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs m-0 mt-0.5">
              {t('Reinforce your knowledge or practice with quick exercises.')}
            </p>
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed m-0 px-1">
            {t('Finish this lesson by completing its practice questions. Your answers are checked by AIM and the lesson is marked complete when you reach the end.')}
          </p>
        )}

        {position.locked ? (
          <span className="flex items-center justify-center h-[54px] rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-sm font-semibold">
            {t('🔒 Practice unlocks after the previous lesson')}
          </span>
        ) : completed ? (
          <Link
            to={`/practice/lesson/${lesson.id}`}
            state={practiceState}
            className="w-full bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-indigo-950/80 ring-2 ring-[#4F46E5] rounded-2xl p-4 flex items-center gap-4 no-underline transition-all shadow-md shadow-indigo-500/10"
          >
            <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ZapIcon className="size-6 text-white" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-extrabold text-indigo-700 dark:text-indigo-300 text-base">{t('Practice again ⚡')}</span>
              <span className="block text-slate-600 dark:text-slate-300 text-xs mt-0.5">{t('Test your comprehension with quick interactive exercises.')}</span>
            </span>
          </Link>
        ) : (
          <Link
            to={`/practice/lesson/${lesson.id}`}
            state={practiceState}
            className="w-full h-[54px] rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white font-extrabold text-base no-underline shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 hover:opacity-95 transition-all"
          >
            {t('Start practice to complete lesson ⚡')}
          </Link>
        )}

        <Link
          to={`/ai-teacher?lessonId=${encodeURIComponent(lesson.id)}&lessonTitle=${encodeURIComponent(lesson.title)}`}
          className="w-full bg-white dark:bg-slate-800/90 ring-1 ring-slate-200/80 dark:ring-slate-700/80 hover:ring-indigo-300 rounded-2xl p-4 flex items-center gap-4 no-underline transition-all shadow-sm"
        >
          <span className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <SparkleIcon className="size-6" />
          </span>
          <span className="font-bold text-slate-900 dark:text-white text-sm">{t('Ask AI tutor ✨')}</span>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <LessonNavigation position={position} courseId={courseId} />
      </div>
    </div>
  );
}
