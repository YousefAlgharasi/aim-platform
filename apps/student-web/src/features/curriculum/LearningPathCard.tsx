import { Popover } from '../../components/common/Popover';
import { CheckIcon, InfoIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';
import { LockIcon } from './CurriculumIcons';
import type { StudentCourse } from './curriculumApi';
import type { Relation } from '../level/bands';
import type { CourseChapterInfo } from './useCourseChapterInfo';

interface LearningPathCardProps {
  course: StudentCourse;
  /** Zero-based position in the path; drives the unit number and the colour. */
  index: number;
  isCurrent: boolean;
  /** Undefined while loading or when it couldn't be fetched. */
  chapters?: CourseChapterInfo;
  onOpen: (card: HTMLElement) => void;
  /** How this course's CEFR band compares with the student's level. */
  relation?: Relation;
}

/** One large course card: icon, chapters, title, status, progress and an Info popover. */
export function LearningPathCard({ course, index, isCurrent, chapters, onOpen, relation = 'unknown' }: LearningPathCardProps) {
  const { t, plural } = useI18n();
  const completed = course.status === 'completed';
  const chapterCount = chapters?.count;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`relative flex flex-col justify-between gap-5 rounded-2xl bg-surface p-5 text-start ring-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
        course.locked
          ? 'cursor-not-allowed opacity-60 ring-line'
          : `cursor-pointer hover:bg-surface-muted ${relation === 'passed' && !isCurrent ? 'opacity-90' : ''} ${isCurrent ? 'ring-2 ring-ink' : 'ring-line hover:ring-line-strong'}`
      }`}
      onClick={(e) => onOpen(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(e.currentTarget);
        }
      }}
      aria-disabled={course.locked || undefined}
      aria-label={course.locked ? t('{title} (locked)', { title: course.title }) : course.title}
    >
      <div className="relative flex items-start gap-3">
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
            {!!chapterCount && (
              <span>
                {plural(chapterCount, { one: t('1 chapter'), two: t('2 chapters'), few: t('{n} chapters [few]', { n: chapterCount }), other: t('{n} chapters', { n: chapterCount }) })}
              </span>
            )}
            {relation === 'unknown' && course.levelCode && <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-ink ring-1 ring-line-strong">{course.levelCode}</span>}
            {isCurrent && (
              <span className="whitespace-nowrap rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-ink-inverse">{t('Current course')}</span>
            )}
          </div>
          <h2 className="m-0 text-2xl font-semibold leading-tight tracking-tight text-ink break-words">{course.title}</h2>
          <div className="flex flex-wrap items-center gap-1.5 empty:hidden">
            {completed && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success-ink">
                <CheckIcon className="size-4" /> {t('Completed')}
              </span>
            )}
            {course.locked && (
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
                <LockIcon className="size-3" /> {t('Locked')}
              </span>
            )}
          </div>
        </div>
        <Popover
          title={t('About this course')}
          renderTrigger={(triggerProps) => (
            <button
              type="button"
              {...triggerProps}
              aria-label={t('{title}: course description', { title: course.title })}
              className="size-10 -m-1 rounded-full flex items-center justify-center border-none cursor-pointer bg-transparent text-ink-muted hover:text-ink hover:bg-surface-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <InfoIcon className="size-5" />
            </button>
          )}
        >
          {course.description && (
            <p dir="auto" className="text-sm leading-relaxed text-ink-soft m-0 mb-3 whitespace-pre-line">{course.description}</p>
          )}
          {chapters && chapters.titles.length > 0 && (
            <div className="mb-3">
              <h3 className="m-0 mb-1.5 text-xs font-extrabold text-ink">{t("What you'll cover")}</h3>
              <ul className="m-0 ps-5 flex flex-col gap-1 text-sm leading-snug text-ink-soft list-disc max-h-48 overflow-y-auto">
                {chapters.titles.map((title, i) => <li key={i} dir="auto">{title}</li>)}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-ink-muted">
            {chapterCount !== undefined && (
              <span>{plural(chapterCount, { one: t('1 chapter'), two: t('2 chapters'), few: t('{n} chapters [few]', { n: chapterCount }), other: t('{n} chapters', { n: chapterCount }) })}</span>
            )}
            <span>{plural(course.lessonCount, { one: t('1 lesson'), two: t('2 lessons'), few: t('{n} lessons [few]', { n: course.lessonCount }), other: t('{n} lessons', { n: course.lessonCount }) })}</span>
            {course.quizCount > 0 && <span>{plural(course.quizCount, { one: t('1 quiz'), two: t('2 quizzes'), few: t('{n} quizzes', { n: course.quizCount }), other: t('{n} quizzes', { n: course.quizCount }) })}</span>}
            {course.examCount > 0 && <span>{t('Final exam')}</span>}
          </div>
        </Popover>
      </div>

      <div className="relative">
        <div>
          <div className="mb-2 flex justify-between gap-3 text-sm text-ink-muted">
            <span>{t('{done} of {total} lessons finished', { done: course.completedLessonCount, total: course.lessonCount })}</span>
            <span className="lp-num font-semibold text-ink">{course.percent}%</span>
          </div>
          <div
            className="h-2 rounded-full bg-ink/10 overflow-hidden"
            role="progressbar"
            aria-valuenow={course.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('{title} progress', { title: course.title })}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-success' : 'bg-brand'}`}
              style={{ width: `${course.percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
