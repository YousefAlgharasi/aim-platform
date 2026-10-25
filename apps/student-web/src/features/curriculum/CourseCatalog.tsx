import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
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
  type CurrentEnrollment,
  type StudentCourse,
} from './curriculumApi';
import styles from './CourseCatalog.module.css';

const STATUS_LABEL: Record<StudentCourse['status'], string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
};

export const COURSE_LOCKED_MESSAGE = 'Finish your current level to unlock this course.';

export function CourseCatalog() {
  const navigate = useNavigate();
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
      .catch((err) => setError(getErrorMessage(err, 'Failed to load courses')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const currentCourseId = enrollment?.found ? enrollment.courseId : null;

  function handleOpen(course: StudentCourse) {
    setNotice('');
    if (course.locked) {
      setNotice(COURSE_LOCKED_MESSAGE);
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
        setEnrollError(getErrorMessage(err, "Couldn't start this course. Please check your connection and try again.")),
      )
      .finally(() => setEnrolling(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (courses.length === 0) {
    return <EmptyState title="No courses available" message="Courses will appear here once they are published." />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Courses</h1>
      {notice && <Banner variant="info">{notice}</Banner>}

      <div className={styles.grid}>
        {courses.map(course => {
          const isCurrent = course.courseId === currentCourseId;
          return (
            <div
              key={course.courseId}
              role="button"
              tabIndex={0}
              className={`${styles.cardLink} ${styles.cardButton} ${course.locked ? styles.cardLocked : ''}`}
              onClick={() => handleOpen(course)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpen(course);
                }
              }}
              aria-disabled={course.locked || undefined}
              aria-label={`${course.title}${course.locked ? ' (locked)' : ''}`}
            >
              <Card>
                <div className={styles.courseCard}>
                  <div className={styles.badgeRow}>
                    {course.levelCode && <span className={styles.levelBadge}>{course.levelCode}</span>}
                    {isCurrent && <span className={styles.currentBadge}>Current course</span>}
                    {course.locked && <span className={styles.lockedBadge}>🔒 Locked</span>}
                  </div>
                  <h2 className={styles.courseName}>{course.title}</h2>
                  {course.description && <p className={styles.courseDesc}>{course.description}</p>}
                  <div className={styles.courseMeta}>
                    <span>{course.lessonCount} lessons</span>
                    {course.quizCount > 0 && <span>{course.quizCount} quizzes</span>}
                    {course.examCount > 0 && <span>Final exam</span>}
                  </div>
                  <div
                    className={styles.progressBar}
                    role="progressbar"
                    aria-valuenow={course.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${course.title} progress`}
                  >
                    <div className={styles.progressFill} style={{ width: `${course.percent}%` }} />
                  </div>
                  <span className={styles.progressLabel}>
                    {STATUS_LABEL[course.status] ?? course.status} · {course.percent}%
                  </span>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <Modal open={!!pending} onClose={() => !enrolling && setPending(null)} title="Start this course?">
        <div className={styles.modalBody}>
          <p className={styles.modalText}>
            {enrollment?.found && enrollment.courseTitle
              ? `You're currently in ${enrollment.courseTitle}. Switching to ${pending?.title ?? ''} will make it your active course instead.`
              : `${pending?.title ?? ''} will become your active course.`}
          </p>
          {enrollError && <Banner variant="error">{enrollError}</Banner>}
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setPending(null)} disabled={enrolling}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmEnroll} disabled={enrolling}>
              {enrolling ? 'Starting…' : 'Start course'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
