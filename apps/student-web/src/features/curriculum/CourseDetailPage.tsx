import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { plural } from '../../i18n';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { DetailSkeleton } from '../../components/common/Skeleton';
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
import { formatDate } from '../../i18n';
import { useLearnerLevel } from '../level/LevelContext';
import { bandOf, relationTo } from '../level/bands';
import { BookIcon } from '../../components/common/Icons';

/** Route: /curriculum/:subjectId — the param is a course id. */
export function CourseDetailPage() {
  const { subjectId: courseId = '' } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { band: level } = useLearnerLevel();
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

  if (loading) return <DetailSkeleton />;
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
  const courseBand = bandOf(course.levelCode);
  const relation = relationTo(courseBand, level);

  return (
    <div className="flex flex-col gap-5">
      <div className="hero-panel">
        <div className="pointer-events-none absolute top-0 end-0 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/curriculum" className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-black/20 px-3 text-xs font-bold text-white no-underline hover:bg-black/30"><BookIcon className="size-4" />{t('Courses')}</Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 text-xs font-extrabold text-white">
              {courseBand ?? course.levelCode}
              {relation !== 'unknown' && <span className="font-bold opacity-90">· {t(relation === 'passed' ? 'Passed level' : relation === 'current' ? 'Your level' : 'Ahead of you')}</span>}
            </span>
            {isCurrent && <span className="hero-cta rounded-full px-2.5 py-1 text-xs font-extrabold">{t('Current course')}</span>}
          </div>
          <h1 className="m-0 text-2xl font-extrabold leading-tight tracking-tight [unicode-bidi:plaintext] sm:text-3xl">{course.title}</h1>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between gap-3 text-xs font-bold text-on-brand">
              <span>{t('{done} of {total} lessons finished', { done: course.completedLessonCount, total: course.lessonCount })}</span>
              <span className="font-extrabold text-white">{course.percent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-black/25 ring-1 ring-inset ring-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={course.percent} aria-label={t('{title} progress', { title: course.title })}>
              <div className="h-full rounded-full bg-white transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${course.percent}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-on-brand">
            {totalChapters > 0 && <span className="rounded-full bg-black/20 px-2.5 py-1">{plural(totalChapters, { one: t('1 chapter'), two: t('2 chapters'), few: t('{n} chapters [few]', { n: totalChapters }), other: t('{n} chapters', { n: totalChapters }) })}</span>}
            {course.quizCount > 0 && <span className="rounded-full bg-black/20 px-2.5 py-1">{plural(course.quizCount, { one: t('1 quiz'), two: t('2 quizzes'), few: t('{n} quizzes', { n: course.quizCount }), other: t('{n} quizzes', { n: course.quizCount }) })}</span>}
            {course.examCount > 0 && <span className="rounded-full bg-black/20 px-2.5 py-1">{t('Final exam')}</span>}
          </div>
          {course.description && <p dir="auto" className="m-0 line-clamp-3 text-sm leading-relaxed text-on-brand">{course.description}</p>}
          {!course.locked && !isCurrent && (
            <div className="flex flex-col gap-2">
              {enrollment?.found && enrollment.courseTitle && (
                <p className="m-0 text-xs text-on-brand">{t("You're currently in {current}. Start this course to make it your active course.", { current: enrollment.courseTitle })}</p>
              )}
              <div>
                <Button onClick={handleEnroll} disabled={enrolling} size="lg" className="hero-cta !ring-0">
                  {enrolling ? t('Starting…') : t('Start course')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!course.locked && relation === 'passed' && (
        <Banner variant="success">{t('You already passed this level. Revisit it any time to review, or move on to your level.')}</Banner>
      )}
      {!course.locked && relation === 'ahead' && (
        <Banner variant="info">{t('This course is above your current level ({level}). You can start it, but it may feel hard.', { level: level ?? '' })}</Banner>
      )}

      {course.locked ? (
        <EmptyState title={t('Course locked')} message={t(COURSE_LOCKED_MESSAGE)} />
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
