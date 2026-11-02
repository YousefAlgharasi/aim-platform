import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Popover } from '../../components/common/Popover';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  enrollInCourse,
  fetchCurrentEnrollment,
  fetchStudentCourses,
  needsPayment,
  type CurrentEnrollment,
  type StudentCourse,
} from './curriculumApi';
import { useI18n } from '../../i18n/I18nContext';
import { LockIcon } from './CurriculumIcons';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { CourseCardBody } from './CourseCardBody';

export const COURSE_LOCKED_MESSAGE = 'Finish your current level to unlock this course.';

export function CourseCatalog() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [enrollment, setEnrollment] = useState<CurrentEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Locked course whose "finish your current level" message is shown in a popover over its card.
  const [lockedCourse, setLockedCourse] = useState<StudentCourse | null>(null);
  const lockedAnchor = useRef<HTMLElement | null>(null);
  const [pending, setPending] = useState<StudentCourse | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  // Card the start-course popover is anchored to; last course kept so content stays during the exit fade.
  const pendingAnchor = useRef<HTMLElement | null>(null);
  const lastPending = useRef<StudentCourse | null>(null);
  if (pending) lastPending.current = pending;
  const shownCourse = pending ?? lastPending.current;

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

  function handleOpen(course: StudentCourse, card: HTMLElement) {
    setPending(null);
    setLockedCourse(null);
    if (course.locked) {
      lockedAnchor.current = card;
      setLockedCourse(course);
      return;
    }
    if (needsPayment(course)) {
      navigate(`/curriculum/${course.courseId}/buy`);
      return;
    }
    if (course.courseId === currentCourseId) {
      navigate(`/curriculum/${course.courseId}`);
      return;
    }
    setEnrollError('');
    pendingAnchor.current = card;
    setPending(course);
  }

  function confirmEnroll() {
    if (!pending) return;
    setEnrolling(true);
    setEnrollError('');
    enrollInCourse(pending.courseId)
      .then(() => {
        const id = pending.courseId;
        setPending(null);
        navigate(`/curriculum/${id}`);
      })
      .catch((err) =>
        setEnrollError(getErrorMessage(err, t("Couldn't start this course. Please check your connection and try again."))),
      )
      .finally(() => setEnrolling(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (courses.length === 0) {
    return <EmptyState title={t('No courses available')} message={t('Courses will appear here once they are published.')} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageTitleBar title={t('Courses')} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => {
          const isCurrent = course.courseId === currentCourseId;
          return (
            <div
              key={course.courseId}
              role="button"
              tabIndex={0}
              className={`flex flex-col gap-2.5 bg-surface rounded-2xl p-4 sm:p-5 ring-1 shadow-sm transition-all duration-200 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                course.locked
                  ? 'ring-line !bg-surface-sunken cursor-not-allowed'
                  : isCurrent
                    ? 'ring-2 ring-brand-ink hover:shadow-md cursor-pointer'
                    : 'ring-line hover:ring-brand-line hover:shadow-md cursor-pointer'
              }`}
              onClick={(e) => handleOpen(course, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpen(course, e.currentTarget);
                }
              }}
              aria-disabled={course.locked || undefined}
              aria-label={course.locked ? t('{title} (locked)', { title: course.title }) : course.title}
            >
              <CourseCardBody course={course} isCurrent={isCurrent} />
            </div>
          );
        })}
      </div>

      <Popover
        open={!!lockedCourse}
        onClose={() => setLockedCourse(null)}
        anchorRef={lockedAnchor}
        placement="cover"
        title={t('Locked')}
      >
        <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted m-0">
          <LockIcon className="size-4 mt-0.5 shrink-0" />
          <span>{t(COURSE_LOCKED_MESSAGE)}</span>
        </p>
      </Popover>

      <Popover
        open={!!pending}
        onClose={() => !enrolling && setPending(null)}
        anchorRef={pendingAnchor}
        placement="cover"
        title={t('Start this course?')}
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-ink-muted m-0">
            {enrollment?.found && enrollment.courseTitle
              ? t("You're currently in {current}. Switching to {next} will make it your active course instead.", { current: enrollment.courseTitle, next: shownCourse?.title ?? '' })
              : t('{title} will become your active course.', { title: shownCourse?.title ?? '' })}
          </p>
          {enrollError && <Banner variant="error">{enrollError}</Banner>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPending(null)} disabled={enrolling}>
              {t('Cancel')}
            </Button>
            <Button variant="primary" onClick={confirmEnroll} disabled={enrolling}>
              {enrolling ? t('Starting…') : t('Start course')}
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
}
