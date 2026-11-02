import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { plural } from '../../i18n';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ChapterLessonList } from './ChapterLessonList';
import { COURSE_LOCKED_MESSAGE } from './CourseCatalog';
import {
  enrollInCourse,
  fetchCourseLevels,
  fetchCurrentEnrollment,
  fetchStudentChapters,
  fetchStudentCourses,
  needsPayment,
  type CurrentEnrollment,
  type FinalExamSummary,
  type LevelWithChapters,
  type StudentCourse,
} from './curriculumApi';
import { useI18n } from '../../i18n/I18nContext';
import { formatDate } from '../../i18n';
import { CourseCardBody } from './CourseCardBody';
import { BookIcon } from '../../components/common/Icons';

/** Route: /curriculum/:subjectId — the param is a course id. */
export function CourseDetailPage() {
  const { subjectId: courseId = '' } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [course, setCourse] = useState<StudentCourse | null>(null);
  const [enrollment, setEnrollment] = useState<CurrentEnrollment | null>(null);
  const [levels, setLevels] = useState<LevelWithChapters[]>([]);
  const [finalExam, setFinalExam] = useState<FinalExamSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    setNotFound(false);
    Promise.all([fetchStudentCourses(), fetchCurrentEnrollment().catch(() => null)])
      .then(async ([courses, current]) => {
        const found = courses.find(c => c.courseId === courseId) ?? null;
        setCourse(found);
        setEnrollment(current);
        if (!found) {
          setNotFound(true);
          return;
        }
        if (found.locked || needsPayment(found)) {
          setLevels([]);
          setFinalExam(null);
          return;
        }
        const levelList = await fetchCourseLevels(courseId);
        const perLevel = await Promise.all(levelList.map(level => fetchStudentChapters(level.id)));
        setLevels(levelList.map((level, i) => ({ level, chapters: perLevel[i].chapters })));
        setFinalExam(perLevel.find(r => r.finalExam)?.finalExam ?? null);
      })
      .catch((err) => setError(getErrorMessage(err, t('Failed to load course'))))
      .finally(() => setLoading(false));
  }, [courseId, t]);

  useEffect(() => { load(); }, [load]);

  function handleEnroll() {
    setEnrolling(true);
    setEnrollError('');
    enrollInCourse(courseId)
      .then(() => load())
      .catch((err) =>
        setEnrollError(getErrorMessage(err, t("Couldn't start this course. Please check your connection and try again."))),
      )
      .finally(() => setEnrolling(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (notFound || !course) {
    return (
      <EmptyState
        title={t('Course not found')}
        message={t("This course isn't available. It may not be published yet.")}
        actionLabel={t('Browse courses')}
        onAction={() => navigate('/curriculum')}
      />
    );
  }

  const isCurrent = enrollment?.found === true && enrollment.courseId === course.courseId;
  const totalChapters = levels.reduce((n, l) => n + l.chapters.length, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-3 z-10 -mt-3 flex items-stretch gap-3 bg-[#4F46E5] text-white rounded-2xl ps-4 pe-2 py-3.5 shadow-lg shadow-indigo-500/30 dark:shadow-black/40">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <CourseCardBody course={course} isCurrent={isCurrent} titleAs="h1" variant="primary" />
        </div>
        <div className="w-px self-stretch bg-white/30" aria-hidden="true" />
        <Link
          to="/curriculum"
          aria-label={t('Courses')}
          title={t('Courses')}
          className="shrink-0 self-center size-10 rounded-xl flex items-center justify-center text-white no-underline hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
        >
          <BookIcon className="size-5" />
        </Link>
      </div>

      {course.locked ? (
        <EmptyState title={t('Course locked')} message={t(COURSE_LOCKED_MESSAGE)} />
      ) : needsPayment(course) ? (
        <EmptyState
          title={t('Get this course to continue')}
          message={course.access?.status === 'pending'
            ? t('The course unlocks as soon as an admin confirms your payment.')
            : course.access?.status === 'failed'
              ? t("You didn't finish this course in time, so your progress was reset. Pay again to retake it from the start.")
              : t('This course needs to be purchased before you can open its lessons.')}
          actionLabel={t('Get this course')}
          onAction={() => navigate(`/curriculum/${course.courseId}/buy`)}
        />
      ) : (
        <>
          {course.access?.status === 'active' && (
            <Banner variant={(course.access.daysLeft ?? 0) <= 5 ? 'warning' : 'info'}>
              {[
                (course.access.daysLeft ?? 0) <= 0
                  ? t('Less than a day left')
                  : plural(course.access.daysLeft ?? 0, {
                      one: t('1 day left'),
                      two: t('2 days left'),
                      few: t('{n} days left [few]', { n: course.access.daysLeft ?? 0 }),
                      other: t('{n} days left', { n: course.access.daysLeft ?? 0 }),
                    }),
                course.access.expiresAt ? t('Finish by {date}', { date: formatDate(course.access.expiresAt) }) : '',
              ].filter(Boolean).join(' · ')}
            </Banner>
          )}
          {!isCurrent && (
            <Banner variant="info">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  {enrollment?.found && enrollment.courseTitle
                    ? t("You're currently in {current}. Start this course to make it your active course.", { current: enrollment.courseTitle })
                    : t('Start this course to make it your active course.')}
                </span>
                <Button size="sm" variant="primary" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? t('Starting…') : t('Start course')}
                </Button>
              </div>
            </Banner>
          )}
          {enrollError && <Banner variant="error">{enrollError}</Banner>}

          {totalChapters === 0 ? (
            <EmptyState title={t('No chapters available')} message={t("This course doesn't have any published chapters yet.")} />
          ) : (
            <ChapterLessonList courseId={course.courseId} levels={levels} finalExam={finalExam} />
          )}
        </>
      )}
    </div>
  );
}
