import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { BackButton } from '../../components/common/BackButton';
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

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8 pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))] border-b border-line-subtle bg-surface/80 dark:bg-elevated/80 backdrop-blur-md shadow-sm">
        <BackButton className="justify-self-start" />
        <h1 className="m-0 text-center text-lg font-extrabold tracking-tight text-ink">{t('Courses')}</h1>
        <span aria-hidden="true" />
      </header>

      <div className="flex flex-col gap-4">
        {courses.map((course, index) => (
          <LearningPathCard
            key={course.courseId}
            course={course}
            index={index}
            isCurrent={course.courseId === currentCourseId}
            chapters={chapterInfo[course.courseId]}
            onOpen={(card) => handleOpen(course, card)}
          />
        ))}
      </div>

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
