import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
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
  type CurrentEnrollment,
  type FinalExamSummary,
  type LevelWithChapters,
  type StudentCourse,
} from './curriculumApi';
import { useI18n } from '../../i18n/I18nContext';
import { BackArrowIcon } from './CurriculumIcons';

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
        if (found.locked) {
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
      <div className="flex items-center gap-3">
        <Link
          to="/curriculum"
          aria-label={t('All courses')}
          className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center transition-colors shrink-0"
        >
          <BackArrowIcon />
        </Link>
        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight">{t('All courses')}</span>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <span className="text-indigo-100 text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full inline-block mb-2">
          {isCurrent ? t('Current course') : t('Course overview')}
        </span>
        <h1 className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-tight m-0 mb-1">{course.title}</h1>
        {course.description && <p className="text-indigo-100/90 text-sm m-0 mb-2">{course.description}</p>}
        <p className="text-indigo-100/90 text-xs m-0 mb-4">
          {course.levelCode ? t('Level {code} · ', { code: course.levelCode }) : ''}{t('{done}/{total} lessons', { done: course.completedLessonCount, total: course.lessonCount })}
        </p>
        <div className="flex justify-between text-xs mb-1.5 font-semibold">
          <span className="text-indigo-100">{t('Course progress')}</span>
          <span className="font-extrabold">{t('{n}% complete', { n: course.percent })}</span>
        </div>
        <div
          className="h-2 bg-black/20 rounded-full overflow-hidden p-0.5 backdrop-blur-sm"
          role="progressbar"
          aria-valuenow={course.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('Course progress')}
        >
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${course.percent}%` }} />
        </div>
      </div>

      {course.locked ? (
        <EmptyState title={t('Course locked')} message={t(COURSE_LOCKED_MESSAGE)} />
      ) : (
        <>
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
