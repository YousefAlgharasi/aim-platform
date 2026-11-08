import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { CheckIcon } from '../../../components/common/Icons';
import * as ui from './ui';
import type { FinishedCourse } from './CurrentCourseLessons';

const PRIMARY = 'inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-brand px-7 text-base font-semibold text-white no-underline transition hover:bg-brand-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface';
const SECONDARY = 'inline-flex h-12 shrink-0 items-center justify-center rounded-full px-7 text-base font-semibold text-ink no-underline ring-1 ring-line-strong transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

/**
 * The roadmap card once every chapter is finished: the finished course as the last (green) stop of the road,
 * then the one thing to do next: the final exam if it is still open, otherwise the next course.
 */
export function RoadmapComplete({ finished }: { finished: FinishedCourse }) {
  const { t } = useI18n();
  const { course, finalExam, nextCourse } = finished;
  const examOpen = !!finalExam && !finalExam.passed;
  const examPassed = !!finalExam && !!finalExam.passed;

  return (
    <section aria-label={t('Course complete')} className={ui.panel}>
      <div className="flex items-center gap-5">
        <span aria-hidden="true" className="lp-node grid size-[68px] shrink-0 place-items-center rounded-full border-solid border-success bg-surface text-success-ink" style={{ borderWidth: 10 }}>
          <CheckIcon className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold text-success-ink">{t('Course complete')}</p>
          <h2 className="lp-display m-0 mt-0.5 text-[1.75rem] font-semibold text-ink [overflow-wrap:anywhere] [unicode-bidi:plaintext] sm:text-[2.25rem]">{course.title}</h2>
          <p className="lp-num m-0 mt-1 text-sm text-ink-muted">
            {t('{lessons} lessons and {quizzes} quizzes finished', { lessons: course.lessonCount, quizzes: course.quizCount })}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        {examOpen && finalExam ? (
          <>
            <p className="m-0 text-base font-semibold text-ink">{t('One last step')}</p>
            <p className="m-0 mt-1 text-sm text-ink-muted [unicode-bidi:plaintext]">
              {finalExam.unlocked ? finalExam.title : t('Finish every chapter to unlock the final exam.')}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {finalExam.unlocked && <Link to={`/assessments/${finalExam.assessmentId}`} className={PRIMARY}>{t('Take the final exam')}</Link>}
              {nextCourse ? (
                <Link to={`/curriculum/${nextCourse.courseId}`} className={SECONDARY}>{t('Next: {course}', { course: nextCourse.title })}</Link>
              ) : (
                <Link to="/curriculum" className={SECONDARY}>{t('Browse courses')}</Link>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="m-0 text-base font-semibold text-ink">
              {examPassed && finalExam?.score != null
                ? t('Final exam passed: {score}%', { score: Math.round(Number(finalExam.score)) })
                : t('Ready for the next step?')}
            </p>
            <p className="m-0 mt-1 text-sm text-ink-muted [unicode-bidi:plaintext]">
              {nextCourse ? nextCourse.title : t('Pick another course to keep your streak going.')}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {nextCourse ? (
                <>
                  <Link to={`/curriculum/${nextCourse.courseId}`} className={PRIMARY}>{t('Start next course')}</Link>
                  <Link to="/curriculum" className={SECONDARY}>{t('Browse courses')}</Link>
                </>
              ) : (
                <Link to="/curriculum" className={PRIMARY}>{t('Browse courses')}</Link>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
