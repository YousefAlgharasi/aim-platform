import { Popover } from '../../components/common/Popover';
import { InfoIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';
import { CourseBillingBadge } from '../course-billing/CourseBillingBadge';
import { LockIcon } from './CurriculumIcons';
import type { StudentCourse } from './curriculumApi';

export const STATUS_LABEL: Record<StudentCourse['status'], string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
};

/** Inside of a course card: badges, title + Info popover, lessons finished and progress. Shared by the course list and the course page. */
export function CourseCardBody({ course, isCurrent, titleAs: Title = 'h2', variant = 'default' }: { course: StudentCourse; isCurrent: boolean; titleAs?: 'h1' | 'h2'; variant?: 'default' | 'primary' }) {
  const { t, plural } = useI18n();
  const completed = course.status === 'completed';
  if (variant === 'primary') {
    // Floating course-page card on the primary colour: current-course badge, title, lessons finished, progress.
    return (
      <>
        <div className="flex items-baseline gap-1.5 min-w-0">
          {isCurrent && (
            <span className="shrink-0 text-sm font-semibold text-indigo-100">{t('Current course')}:</span>
          )}
          <Title className="font-extrabold text-base tracking-tight leading-tight text-white m-0 min-w-0 truncate">{course.title}</Title>
        </div>
        <div className="flex justify-between gap-3 text-xs font-bold text-indigo-100">
          <span>{t('{done} of {total} lessons finished', { done: course.completedLessonCount, total: course.lessonCount })}</span>
          <span className="font-extrabold text-white">{course.percent}%</span>
        </div>
        <div
          className="h-1.5 bg-white/25 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={course.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('{title} progress', { title: course.title })}
        >
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${course.percent}%` }} />
        </div>
      </>
    );
  }
  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {course.levelCode && (
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
            {course.levelCode}
          </span>
        )}
        {isCurrent && (
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-white bg-indigo-600 px-2.5 py-1 rounded-full">
            {t('Current course')}
          </span>
        )}
        <CourseBillingBadge price={course.price} access={course.access} />
        {course.locked && (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
            <LockIcon className="size-3" /> {t('Locked')}
          </span>
        )}
      </div>
      <div className="flex items-start gap-1.5">
        <Title className="font-extrabold text-lg tracking-tight leading-tight text-slate-900 dark:text-white m-0">{course.title}</Title>
        <Popover
          title={t('About this course')}
          renderTrigger={(triggerProps) => (
            <button
              type="button"
              {...triggerProps}
              aria-label={t('{title}: course description', { title: course.title })}
              className="size-6 shrink-0 rounded-full flex items-center justify-center border-none cursor-pointer bg-transparent text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <InfoIcon className="size-[18px]" />
            </button>
          )}
        >
          {course.description && (
            <p dir="auto" className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 m-0 mb-3 whitespace-pre-line">{course.description}</p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>{plural(course.lessonCount, { one: t('1 lesson'), two: t('2 lessons'), few: t('{n} lessons [few]', { n: course.lessonCount }), other: t('{n} lessons', { n: course.lessonCount }) })}</span>
            {course.quizCount > 0 && <span>{plural(course.quizCount, { one: t('1 quiz'), two: t('2 quizzes'), few: t('{n} quizzes', { n: course.quizCount }), other: t('{n} quizzes', { n: course.quizCount }) })}</span>}
            {course.examCount > 0 && <span>{t('Final exam')}</span>}
          </div>
        </Popover>
      </div>
      <div className="mt-auto pt-1">
        <span className="block mb-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
          {t('{done} of {total} lessons finished', { done: course.completedLessonCount, total: course.lessonCount })}
        </span>
        <div
          className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={course.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('{title} progress', { title: course.title })}
        >
          <div
            className={`h-full rounded-full ${completed ? 'bg-emerald-500' : 'bg-gradient-to-r rtl:bg-gradient-to-l from-indigo-500 to-violet-500'}`}
            style={{ width: `${course.percent}%` }}
          />
        </div>
        <span className="block mt-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
          {STATUS_LABEL[course.status] ? t(STATUS_LABEL[course.status]) : course.status} · {course.percent}%
        </span>
      </div>
    </>
  );
}
