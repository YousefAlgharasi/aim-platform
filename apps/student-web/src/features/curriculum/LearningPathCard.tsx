import { Popover } from '../../components/common/Popover';
import { CheckIcon, InfoIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';
import { LockIcon } from './CurriculumIcons';
import type { StudentCourse } from './curriculumApi';
import type { Relation } from '../level/bands';
import type { CourseChapterInfo } from './useCourseChapterInfo';
import { COURSE_ART } from '../../assets/course-art';

/** Pastel backgrounds cycled by position. Purely decorative: status is shown by labels and icons. */
const PALETTES = [
  { bg: 'from-brand-soft to-info-soft', shape: 'bg-brand/10' },
  { bg: 'from-accent-soft to-success-soft', shape: 'bg-accent/15' },
  { bg: 'from-secondary-soft to-brand-soft', shape: 'bg-secondary/10' },
  { bg: 'from-warning-soft to-accent-soft', shape: 'bg-warning/15' },
] as const;

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
  const palette = PALETTES[index % PALETTES.length];
  const completed = course.status === 'completed';
  const chapterCount = chapters?.count;
  const art = COURSE_ART[index % COURSE_ART.length];

  return (
    <div
      role="button"
      tabIndex={0}
      className={`relative overflow-hidden flex flex-col justify-between gap-3 rounded-2xl p-4 bg-gradient-to-br ${palette.bg} text-start transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
        course.locked
          ? 'cursor-not-allowed opacity-75 saturate-50'
          : `cursor-pointer hover:shadow-md ${relation === 'passed' && !isCurrent ? 'opacity-90' : ''} ${isCurrent ? 'ring-2 ring-brand-ink' : ''}`
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
      <span aria-hidden="true" className={`pointer-events-none absolute -top-8 -end-8 size-28 rounded-full ${palette.shape}`} />
      <span aria-hidden="true" className={`pointer-events-none absolute -bottom-10 start-1/3 size-24 rounded-full ${palette.shape}`} />

      <div className="relative flex items-start gap-3">
        <span aria-hidden="true" className="size-12 shrink-0 rounded-xl bg-surface/70 flex items-center justify-center p-1.5">
          <img src={art} alt="" aria-hidden="true" className="size-full object-contain" loading="lazy" decoding="async" />
        </span>
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-bold uppercase tracking-wider rtl:normal-case rtl:tracking-normal text-ink-soft">
            {!!chapterCount && (
              <span className="normal-case tracking-normal">
                {plural(chapterCount, { one: t('1 chapter'), two: t('2 chapters'), few: t('{n} chapters [few]', { n: chapterCount }), other: t('{n} chapters', { n: chapterCount }) })}
              </span>
            )}
            {relation === 'unknown' && course.levelCode && <span className="rounded-full bg-surface/70 px-2 py-0.5 text-brand-ink">{course.levelCode}</span>}
            {isCurrent && (
              <span className="whitespace-nowrap text-[10px] font-extrabold uppercase tracking-normal text-white bg-brand px-1.5 py-0.5 rounded-full">{t('Current course')}</span>
            )}
          </div>
          <h2 className="m-0 text-lg font-extrabold leading-tight tracking-tight text-ink break-words">{course.title}</h2>
          <div className="flex flex-wrap items-center gap-1.5 empty:hidden">
            {completed && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider rtl:normal-case rtl:tracking-normal text-white bg-success px-2.5 py-1 rounded-full">
                <CheckIcon className="size-3 text-white" /> {t('Completed')}
              </span>
            )}
            {course.locked && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider rtl:normal-case rtl:tracking-normal text-ink-soft bg-surface/70 px-2.5 py-1 rounded-full">
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
              className="size-10 -m-1 rounded-full flex items-center justify-center border-none cursor-pointer bg-surface/60 text-ink-soft hover:text-brand-ink hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
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
          <div className="mb-1 flex justify-between gap-3 text-xs font-bold text-ink-soft">
            <span>{t('{done} of {total} lessons finished', { done: course.completedLessonCount, total: course.lessonCount })}</span>
            <span>{course.percent}%</span>
          </div>
          <div
            className="h-2 rounded-full bg-ink/10 ring-1 ring-inset ring-ink/10 overflow-hidden"
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
