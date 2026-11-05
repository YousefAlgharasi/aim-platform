import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Popover } from '../../components/common/Popover';
import { CardGridSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  fetchCurrentEnrollment,
  fetchStudentCourses,
  type CurrentEnrollment,
  type StudentCourse,
} from './curriculumApi';
import { useI18n } from '../../i18n/I18nContext';
import { LockIcon } from './CurriculumIcons';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { Banner } from '../../components/common/Banner';
import { LevelBadge, RelationChip } from '../level/LevelBadge';
import { useLearnerLevel } from '../level/LevelContext';
import { BANDS, BAND_NAME, bandOf, relationTo, type Band } from '../level/bands';
import { LearningPathCard } from './LearningPathCard';
import { useCourseChapterInfo } from './useCourseChapterInfo';

/** How long the locked-course popover stays before it fades out. */
const NOTICE_MS = 3000;

export const COURSE_LOCKED_MESSAGE = 'Finish your current level to unlock this course.';

export function CourseCatalog() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [enrollment, setEnrollment] = useState<CurrentEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Locked course whose explanation is shown in a popover next to its card (clears itself after a moment).
  const [notice, setNotice] = useState<StudentCourse | null>(null);
  const noticeAnchor = useRef<HTMLElement | null>(null);
  const [filter, setFilter] = useState<'all' | Band>('all');
  const { band, hasPlacement, loading: levelLoading } = useLearnerLevel();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      fetchStudentCourses(),
      // Enrollment failure shouldn't hide the catalog; treat as "no active course".
      fetchCurrentEnrollment().catch(() => null),
    ])
      .then(([courseList, current]) => {
        setCourses(courseList);
        setEnrollment(current);
      })
      .catch((err) => setError(getErrorMessage(err, t('Failed to load courses'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const currentCourseId = enrollment?.found ? enrollment.courseId : null;
  const chapterInfo = useCourseChapterInfo(courses);

  // An open course opens its page. A locked one explains why in a short popover next to the card.
  function handleOpen(course: StudentCourse, card: HTMLElement) {
    if (!course.locked) {
      navigate(`/curriculum/${course.courseId}`);
      return;
    }
    noticeAnchor.current = card;
    setNotice(null);
    // Re-open on the next tick so tapping another card moves the popover instead of leaving it.
    setTimeout(() => setNotice(course), 0);
  }

  if (loading) return <CardGridSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (courses.length === 0) {
    return <EmptyState title={t('No courses available')} message={t('Courses will appear here once they are published.')} />;
  }

  const groups = BANDS.map((band) => ({ band, list: courses.filter((c) => bandOf(c.levelCode) === band) })).filter((g) => g.list.length > 0);
  const unleveled = courses.filter((c) => bandOf(c.levelCode) === null);
  const shown = filter === 'all' ? groups : groups.filter((g) => g.band === filter);
  const currentCourse = courses.find((c) => c.courseId === currentCourseId) ?? null;
  const totalLessons = courses.reduce((n, c) => n + c.lessonCount, 0);
  const doneLessons = courses.reduce((n, c) => n + c.completedLessonCount, 0);
  const overall = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;
  let cardIndex = 0;

  return (
    <div className="stagger mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageTitleBar title={t('Courses')} subtitle={t('Pick up where you are. Courses follow your level.')} />

      <div className="hero-panel">
        <div className="pointer-events-none absolute top-0 end-0 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><LevelBadge tone="onBrand" /><span className="text-xs font-bold text-on-brand">{t('{pct}% of the whole path', { pct: overall })}</span></div>
            <p className="m-0 mt-2 text-xl font-extrabold leading-snug [unicode-bidi:plaintext] sm:text-2xl">
              {currentCourse ? currentCourse.title : band ? t('Choose a {level} course to begin', { level: band }) : t('Find your level to get started')}
            </p>
            {currentCourse && <p className="m-0 mt-1 text-sm text-on-brand">{t('{done} of {total} lessons finished', { done: currentCourse.completedLessonCount, total: currentCourse.lessonCount })}</p>}
          </div>
          <Link
            to={currentCourse ? `/curriculum/${currentCourse.courseId}` : band ? '#levels' : '/placement'}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl hero-cta px-6 text-[15px] font-bold no-underline shadow-lg shadow-black/20 transition-all hover:-translate-y-px active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {currentCourse ? t('Continue') : band ? t('Browse levels') : t('Take the placement test')}
          </Link>
        </div>
      </div>

      {!hasPlacement && !levelLoading && (
        <Banner variant="info">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t('Take the placement test so courses are matched to your real level.')}</span>
            <Link to="/placement" className="text-sm font-bold text-brand-ink">{t('Take the placement test')}</Link>
          </div>
        </Banner>
      )}

      <div id="levels" className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t('Filter by level')}>
        {(['all', ...groups.map((g) => g.band)] as Array<'all' | Band>).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`min-h-10 shrink-0 cursor-pointer rounded-full border-0 px-4 text-sm font-bold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${filter === f ? 'bg-brand text-white ring-brand' : 'bg-surface text-ink-soft ring-line hover:bg-brand-soft'}`}
          >
            {f === 'all' ? t('All levels') : f}{f !== 'all' && f === band ? ' ★' : ''}
          </button>
        ))}
      </div>

      {shown.map(({ band: b, list }) => {
        const rel = relationTo(b, band);
        return (
          <section key={b} className="flex flex-col gap-3" aria-label={`${b} ${t(BAND_NAME[b])}`}>
            <div className="flex flex-wrap items-center gap-2 px-1">
              <h2 className="m-0 text-base font-extrabold tracking-tight text-ink">{b} · {t(BAND_NAME[b])}</h2>
              <RelationChip relation={rel} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {list.map((course) => (
                <LearningPathCard
                  key={course.courseId}
                  course={course}
                  index={cardIndex++}
                  relation={rel}
                  isCurrent={course.courseId === currentCourseId}
                  chapters={chapterInfo[course.courseId]}
                  onOpen={(card) => handleOpen(course, card)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {filter === 'all' && unleveled.length > 0 && (
        <section className="flex flex-col gap-3" aria-label={t('More courses')}>
          <h2 className="m-0 px-1 text-base font-extrabold tracking-tight text-ink">{t('More courses')}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {unleveled.map((course) => (
              <LearningPathCard key={course.courseId} course={course} index={cardIndex++} isCurrent={course.courseId === currentCourseId} chapters={chapterInfo[course.courseId]} onOpen={(card) => handleOpen(course, card)} />
            ))}
          </div>
        </section>
      )}

      <Popover
        open={!!notice}
        onClose={() => setNotice(null)}
        anchorRef={noticeAnchor}
        placement="below"
        title={t('Locked')}
      >
        <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted m-0">
          <LockIcon className="size-4 mt-0.5 shrink-0" />
          <span>{t(COURSE_LOCKED_MESSAGE)}</span>
        </p>
      </Popover>
    </div>
  );
}
