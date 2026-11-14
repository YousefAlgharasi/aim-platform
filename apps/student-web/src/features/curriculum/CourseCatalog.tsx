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
import { BANDS, BAND_NAME, bandOf, relationTo } from '../level/bands';
import { LearningPathCard } from './LearningPathCard';
import { useCourseChapterInfo } from './useCourseChapterInfo';
import { lockedReason } from './lockedReason';

/** How long the locked-course popover stays before it fades out. */
const NOTICE_MS = 3000;

export { COURSE_LOCKED_MESSAGE } from './lockedReason';

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
  // The API lists courses in learning-path order. Courses with no CEFR level that come before the first levelled one
  // (the beginner "Starter") are where the path begins, so they lead the page instead of sinking into "More courses".
  const firstLevelled = courses.findIndex((c) => bandOf(c.levelCode) !== null);
  const leading = firstLevelled > 0 ? courses.slice(0, firstLevelled).filter((c) => bandOf(c.levelCode) === null) : [];
  const unleveled = courses.filter((c) => bandOf(c.levelCode) === null && !leading.includes(c));
  const currentCourse = courses.find((c) => c.courseId === currentCourseId) ?? null;
  const totalLessons = courses.reduce((n, c) => n + c.lessonCount, 0);
  const doneLessons = courses.reduce((n, c) => n + c.completedLessonCount, 0);
  const overall = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;
  let cardIndex = 0;

  return (
    <div className="stagger flex w-full flex-col gap-8">
      <PageTitleBar title={t('Courses')} />

      <section>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div data-tour="level-badge" className="flex flex-wrap items-center gap-3"><LevelBadge /><span className="lp-num text-sm text-ink-muted">{t('{pct}% of the whole path', { pct: overall })}</span></div>
            <p className="lp-display m-0 mt-3 text-[1.75rem] font-semibold [unicode-bidi:plaintext] sm:text-[2.25rem]">
              {currentCourse
                ? <Link to={`/curriculum/${currentCourse.courseId}`} className="text-ink no-underline hover:underline">{currentCourse.title}</Link>
                : band ? t('Choose a {level} course to begin', { level: band }) : t('Find your level to get started')}
            </p>
            {currentCourse && <p className="m-0 mt-2 text-base text-ink-muted">{t('{done} of {total} lessons finished', { done: currentCourse.completedLessonCount, total: currentCourse.lessonCount })}</p>}
          </div>
          {/* With a current course, its card right below is the way in. Without one, this is the way to start. */}
          {!currentCourse && (
            <Link
              to={band ? '#levels' : '/placement'}
              className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white no-underline transition hover:bg-brand-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
              {band ? t('Browse levels') : t('Take the placement test')}
            </Link>
          )}
        </div>
      </section>

      {!hasPlacement && !levelLoading && (
        <Banner variant="info">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t('Take the placement test so courses are matched to your real level.')}</span>
            <Link to="/placement" className="text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4">{t('Take the placement test')}</Link>
          </div>
        </Banner>
      )}


      {leading.length > 0 && (
        <section data-tour="courses-start" className="flex flex-col gap-3 border-t border-brand-line pt-6" aria-label={t('Start here')}>
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-ink">{t('Start here')}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {leading.map((course) => (
              <LearningPathCard key={course.courseId} course={course} index={cardIndex++} isCurrent={course.courseId === currentCourseId} chapters={chapterInfo[course.courseId]} onOpen={(card) => handleOpen(course, card)} />
            ))}
          </div>
        </section>
      )}

      {groups.map(({ band: b, list }, groupIndex) => {
        const rel = relationTo(b, band);
        return (
          <section key={b} id={groupIndex === 0 ? 'levels' : undefined} data-tour={groupIndex === 0 ? 'courses-levels' : undefined} className="flex flex-col gap-3" aria-label={`${b} ${t(BAND_NAME[b])}`}>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-ink">{b} <span className="font-medium text-ink-muted">{t(BAND_NAME[b])}</span></h2>
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

      {unleveled.length > 0 && (
        <section className="flex flex-col gap-3" aria-label={t('More courses')}>
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-ink">{t('More courses')}</h2>
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
          <span>{notice ? lockedReason(notice, courses, t) : ''}</span>
        </p>
      </Popover>
    </div>
  );
}
