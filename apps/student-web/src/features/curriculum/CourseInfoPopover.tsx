import { Popover } from '../../components/common/Popover';
import { InfoIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';
import type { StudentCourse } from './curriculumApi';

interface CourseInfoPopoverProps {
  course: StudentCourse;
  /** Published chapter titles, when known. */
  chapterTitles?: string[];
  chapterCount?: number;
}

/** The ⓘ button with the course description, "What you'll cover" and the counts. One look for the Courses page and the course page. */
export function CourseInfoPopover({ course, chapterTitles, chapterCount }: CourseInfoPopoverProps) {
  const { t, plural } = useI18n();
  return (
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
      {chapterTitles && chapterTitles.length > 0 && (
        <div className="mb-3">
          <h3 className="m-0 mb-1.5 text-xs font-extrabold text-ink">{t("What you'll cover")}</h3>
          <ul className="m-0 ps-5 flex flex-col gap-1 text-sm leading-snug text-ink-soft list-disc max-h-48 overflow-y-auto">
            {chapterTitles.map((title, i) => <li key={i} dir="auto">{title}</li>)}
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
  );
}
