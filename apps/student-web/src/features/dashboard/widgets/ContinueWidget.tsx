import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import type {
  ContinueLearningLesson,
  CurrentEnrollment,
  QuickStartLesson,
  RecommendedCourse,
} from '../dashboardApi';
import * as ui from './ui';

interface ContinueWidgetProps {
  continueLesson: ContinueLearningLesson | null;
  quickStart: QuickStartLesson | null;
  recommendedCourse: RecommendedCourse | null;
  enrollment: CurrentEnrollment | null;
}

/** "Continue learning" hero: resume lesson → quick-start lesson → current/recommended course → placement. */
export function ContinueWidget({ continueLesson, quickStart, recommendedCourse, enrollment }: ContinueWidgetProps) {
  const { t } = useI18n();
  const enrolledCourse =
    enrollment?.found && enrollment.courseId
      ? { id: enrollment.courseId, title: enrollment.courseTitle ?? t('Your course') }
      : null;
  const course = enrolledCourse ?? (recommendedCourse
    ? { id: recommendedCourse.courseId, title: recommendedCourse.courseTitle }
    : null);

  if (!continueLesson && !quickStart && !course) {
    return (
      <Card>
        <EmptyState
          title={t('Find your starting point')}
          message={t('Take the placement test so we can recommend a course and your first lesson.')}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link to="/placement" className={ui.primaryLink}>{t('Take the placement test')}</Link>
          <Link to="/curriculum" className={ui.link}>{t('Browse courses')}</Link>
        </div>
      </Card>
    );
  }

  const pct = continueLesson ? Math.min(100, Math.max(0, Math.round(continueLesson.percent))) : 0;

  return (
    <Card>
      <div className="flex flex-col gap-3">
        {continueLesson ? (
          <>
            <span className={ui.eyebrow}>{t('Continue learning')}</span>
            <span className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white [unicode-bidi:plaintext]">{continueLesson.lessonTitle}</span>
            <div
              className={ui.barTrack}
              role="progressbar"
              aria-label={t('Lesson progress')}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <div className={ui.barFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={ui.meta}>{t('{pct}% complete', { pct })}</span>
            <div className="flex flex-wrap items-center gap-3">
              <Link to={`/lessons/${continueLesson.lessonId}`} className={ui.primaryLink}>{t('Resume lesson')}</Link>
            </div>
          </>
        ) : quickStart ? (
          <>
            <span className={ui.eyebrow}>
              {t('Start here')}{quickStart.skillName ? <> · <bdi>{quickStart.skillName}</bdi></> : null}
            </span>
            <span className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white [unicode-bidi:plaintext]">{quickStart.lessonTitle}</span>
            {quickStart.lessonDescription && <span className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 [unicode-bidi:plaintext]">{quickStart.lessonDescription}</span>}
            <div className="flex flex-wrap items-center gap-3">
              <Link to={`/lessons/${quickStart.lessonId}`} className={ui.primaryLink}>{t('Start lesson')}</Link>
            </div>
          </>
        ) : null}

        {course && (
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-700">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className={ui.label}>{enrolledCourse ? t('Current course') : t('Recommended course')}</span>
              <span className="truncate text-sm font-bold text-slate-900 dark:text-white">{course.title}</span>
              {!enrolledCourse && recommendedCourse?.estimatedLevel && (
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('Level: {level}', { level: recommendedCourse.estimatedLevel })}</span>
              )}
            </div>
            <Link to={`/curriculum/${course.id}`} className={`${ui.link} shrink-0`}>{t('Open course')}</Link>
          </div>
        )}
      </div>
    </Card>
  );
}
