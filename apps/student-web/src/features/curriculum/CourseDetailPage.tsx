import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './CourseDetail.module.css';

interface Lesson {
  id: string;
  name: string;
  duration: string;
  status: 'completed' | 'current' | 'available' | 'locked';
}

interface Chapter {
  id: string;
  title: string;
  completedCount: number;
  totalCount: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  name: string;
  description: string;
  unitCount: number;
  lessonCount: number;
  completionPercent: number;
  chapters: Chapter[];
}

export function CourseDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchCourse() {
    setLoading(true);
    setError('');
    apiClient.get<CourseDetail>(`/api/curriculum/subjects/${subjectId}`)
      .then(setCourse)
      .catch((err: ApiError) => setError(err.message || 'Failed to load course'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCourse(); }, [subjectId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchCourse} />;
  if (!course) return null;

  function getIconClass(status: Lesson['status']) {
    switch (status) {
      case 'completed': return styles.iconCompleted;
      case 'current': return styles.iconCurrent;
      case 'locked': return styles.iconLocked;
      default: return styles.iconDefault;
    }
  }

  function getIconSymbol(status: Lesson['status']) {
    switch (status) {
      case 'completed': return '✓';
      case 'current': return '▶';
      case 'locked': return '🔒';
      default: return '○';
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{course.name}</h1>
        <p className={styles.description}>{course.description}</p>
        <div className={styles.meta}>
          <span>{course.unitCount} units</span>
          <span>{course.lessonCount} lessons</span>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${course.completionPercent}%` }}
            role="progressbar"
            aria-valuenow={course.completionPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${course.name} progress`}
          />
        </div>
        <span className={styles.progressLabel}>{course.completionPercent}% complete</span>
      </div>

      <div className={styles.chapterList}>
        {course.chapters.map(chapter => (
          <Card key={chapter.id}>
            <div className={styles.chapterCard}>
              <div className={styles.chapterHeader}>
                <h2 className={styles.chapterTitle}>{chapter.title}</h2>
                <span className={styles.chapterProgress}>
                  {chapter.completedCount}/{chapter.totalCount}
                </span>
              </div>
              <div className={styles.lessonList}>
                {chapter.lessons.map(lesson => {
                  const isLocked = lesson.status === 'locked';
                  const content = (
                    <>
                      <span className={`${styles.lessonIcon} ${getIconClass(lesson.status)}`}>
                        {getIconSymbol(lesson.status)}
                      </span>
                      <div className={styles.lessonInfo}>
                        <span className={styles.lessonName}>{lesson.name}</span>
                        <span className={styles.lessonDuration}>{lesson.duration}</span>
                      </div>
                      {lesson.status === 'completed' && (
                        <span className={`${styles.statusBadge} ${styles.badgeCompleted}`}>Done</span>
                      )}
                      {lesson.status === 'current' && (
                        <span className={`${styles.statusBadge} ${styles.badgeCurrent}`}>Current</span>
                      )}
                    </>
                  );

                  if (isLocked) {
                    return (
                      <div key={lesson.id} className={`${styles.lessonItem} ${styles.lessonLocked}`} aria-disabled="true">
                        {content}
                      </div>
                    );
                  }

                  return (
                    <Link key={lesson.id} to={`/lessons/${lesson.id}`} className={styles.lessonItem}>
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
