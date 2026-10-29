import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Modal } from '../../components/common/Modal';
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
import { CourseBillingBadge } from '../course-billing/CourseBillingBadge';

const STATUS_LABEL: Record<StudentCourse['status'], string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
};

export const COURSE_LOCKED_MESSAGE = 'Finish your current level to unlock this course.';

export function CourseCatalog() {
  const navigate = useNavigate();
  const { t, plural } = useI18n();
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [enrollment, setEnrollment] = useState<CurrentEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<StudentCourse | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');

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

  function handleOpen(course: StudentCourse) {
    setNotice('');
    if (course.locked) {
      setNotice(t(COURSE_LOCKED_MESSAGE));
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
      <div>
        <span className="text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider">{t('Learn')}</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0 mt-1">{t('Courses')}</h1>
      </div>
      {notice && <Banner variant="info">{notice}</Banner>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => {
          const isCurrent = course.courseId === currentCourseId;
          const completed = course.status === 'completed';
          return (
            <div
              key={course.courseId}
              role="button"
              tabIndex={0}
              className={`flex flex-col gap-2.5 bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 ring-1 shadow-sm transition-all duration-200 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                course.locked
                  ? 'ring-slate-200/60 dark:ring-slate-800 opacity-65 cursor-not-allowed'
                  : isCurrent
                    ? 'ring-2 ring-[#4F46E5] dark:ring-indigo-400 hover:shadow-md cursor-pointer'
                    : 'ring-[#E2E8F0] dark:ring-slate-700 hover:ring-indigo-300 dark:hover:ring-indigo-700 hover:shadow-md cursor-pointer'
              }`}
              onClick={() => handleOpen(course)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpen(course);
                }
              }}
              aria-disabled={course.locked || undefined}
              aria-label={course.locked ? t('{title} (locked)', { title: course.title }) : course.title}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                {course.levelCode && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
                    {course.levelCode}
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-indigo-600 px-2.5 py-1 rounded-full">
                    {t('Current course')}
                  </span>
                )}
                <CourseBillingBadge price={course.price} access={course.access} />
                {course.locked && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                    <LockIcon className="size-3" /> {t('Locked')}
                  </span>
                )}
              </div>
              <h2 className="font-extrabold text-lg tracking-tight leading-tight text-slate-900 dark:text-white m-0">{course.title}</h2>
              {course.description && (
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 m-0 line-clamp-2">{course.description}</p>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                <span>{plural(course.lessonCount, { one: t('1 lesson'), two: t('2 lessons'), few: t('{n} lessons [few]', { n: course.lessonCount }), other: t('{n} lessons', { n: course.lessonCount }) })}</span>
                {course.quizCount > 0 && <span>{plural(course.quizCount, { one: t('1 quiz'), two: t('2 quizzes'), few: t('{n} quizzes', { n: course.quizCount }), other: t('{n} quizzes', { n: course.quizCount }) })}</span>}
                {course.examCount > 0 && <span>{t('Final exam')}</span>}
              </div>
              <div className="mt-auto pt-1">
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
            </div>
          );
        })}
      </div>

      <Modal open={!!pending} onClose={() => !enrolling && setPending(null)} title={t('Start this course?')}>
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 m-0">
            {enrollment?.found && enrollment.courseTitle
              ? t("You're currently in {current}. Switching to {next} will make it your active course instead.", { current: enrollment.courseTitle, next: pending?.title ?? '' })
              : t('{title} will become your active course.', { title: pending?.title ?? '' })}
          </p>
          {enrollError && <Banner variant="error">{enrollError}</Banner>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPending(null)} disabled={enrolling}>
              {t('Cancel')}
            </Button>
            <Button variant="primary" onClick={confirmEnroll} disabled={enrolling}>
              {enrolling ? t('Starting…') : t('Start course')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
