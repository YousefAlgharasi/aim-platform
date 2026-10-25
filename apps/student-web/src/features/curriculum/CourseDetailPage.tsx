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
import styles from './CourseDetail.module.css';

/** Route: /curriculum/:subjectId — the param is a course id. */
export function CourseDetailPage() {
  const { subjectId: courseId = '' } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
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
      .catch((err) => setError(getErrorMessage(err, 'Failed to load course')))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  function handleEnroll() {
    setEnrolling(true);
    setEnrollError('');
    enrollInCourse(courseId)
      .then(() => load())
      .catch((err) =>
        setEnrollError(getErrorMessage(err, "Couldn't start this course. Please check your connection and try again.")),
      )
      .finally(() => setEnrolling(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (notFound || !course) {
    return (
      <EmptyState
        title="Course not found"
        message="This course isn't available. It may not be published yet."
        actionLabel="Browse courses"
        onAction={() => navigate('/curriculum')}
      />
    );
  }

  const isCurrent = enrollment?.found === true && enrollment.courseId === course.courseId;
  const totalChapters = levels.reduce((n, l) => n + l.chapters.length, 0);

  return (
    <div className={styles.container}>
      <Link to="/curriculum" className={styles.backLink}>← All courses</Link>

      <div className={styles.header}>
        <h1 className={styles.heading}>{course.title}</h1>
        {course.description && <p className={styles.description}>{course.description}</p>}
        <div className={styles.meta}>
          {course.levelCode && <span>Level {course.levelCode}</span>}
          <span>{course.completedLessonCount}/{course.lessonCount} lessons</span>
          {isCurrent && <span>Current course</span>}
        </div>
        <div className={styles.progressSection}>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={course.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Course progress"
          >
            <div className={styles.progressFill} style={{ width: `${course.percent}%` }} />
          </div>
          <span className={styles.progressLabel}>{course.percent}% complete</span>
        </div>
      </div>

      {course.locked ? (
        <EmptyState title="Course locked" message={COURSE_LOCKED_MESSAGE} />
      ) : (
        <>
          {!isCurrent && (
            <Banner variant="info">
              <div className={styles.enrollBanner}>
                <span>
                  {enrollment?.found && enrollment.courseTitle
                    ? `You're currently in ${enrollment.courseTitle}. Start this course to make it your active course.`
                    : 'Start this course to make it your active course.'}
                </span>
                <Button size="sm" variant="primary" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Starting…' : 'Start course'}
                </Button>
              </div>
            </Banner>
          )}
          {enrollError && <Banner variant="error">{enrollError}</Banner>}

          {totalChapters === 0 ? (
            <EmptyState title="No chapters available" message="This course doesn't have any published chapters yet." />
          ) : (
            <ChapterLessonList courseId={course.courseId} levels={levels} finalExam={finalExam} />
          )}
        </>
      )}
    </div>
  );
}
