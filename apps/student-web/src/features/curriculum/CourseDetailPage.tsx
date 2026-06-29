import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiError } from '../../types';
import styles from './CourseDetail.module.css';

interface CourseSummary {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  status: string;
}

interface LevelSummary {
  id: string;
  courseId: string;
  title: string;
  code: string | null;
  description: string | null;
}

interface LevelListResponse {
  levels: LevelSummary[];
  total: number;
  page: number;
  limit: number;
}

export function CourseDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [levels, setLevels] = useState<LevelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchCourse() {
    setLoading(true);
    setError('');
    Promise.all([
      apiClient.get<CourseSummary>(`/curriculum/courses/${subjectId}`),
      apiClient.get<LevelListResponse>(`/curriculum/courses/${subjectId}/levels`),
    ])
      .then(([courseRes, levelsRes]) => {
        setCourse(courseRes);
        setLevels(levelsRes.levels);
      })
      .catch((err: ApiError) => setError(err.message || 'Failed to load course'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCourse(); }, [subjectId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchCourse} />;
  if (!course) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{course.title}</h1>
        {course.description && <p className={styles.description}>{course.description}</p>}
      </div>

      <div className={styles.chapterList}>
        {levels.length === 0 ? (
          <EmptyState title="No units available" message="This course doesn't have any units yet." />
        ) : (
          levels.map(level => (
            <Card key={level.id}>
              <div className={styles.chapterCard}>
                <div className={styles.chapterHeader}>
                  <h2 className={styles.chapterTitle}>{level.title}</h2>
                </div>
                {level.description && <p>{level.description}</p>}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
