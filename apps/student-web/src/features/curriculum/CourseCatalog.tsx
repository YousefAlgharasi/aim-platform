import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiError } from '../../types';
import styles from './CourseCatalog.module.css';

interface CourseSummary {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  status: string;
}

interface CourseListResponse {
  courses: CourseSummary[];
  total: number;
  page: number;
  limit: number;
}

export function CourseCatalog() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchCourses() {
    setLoading(true);
    setError('');
    apiClient.get<CourseListResponse>('/curriculum/courses')
      .then((res) => setCourses(res.courses))
      .catch((err: ApiError) => setError(err.message || 'Failed to load courses'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCourses(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchCourses} />;
  if (courses.length === 0) {
    return <EmptyState title="No courses available" message="Courses will appear here once they are published." />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Courses</h1>
      <div className={styles.grid}>
        {courses.map(course => (
          <Link key={course.id} to={`/curriculum/${course.id}`} className={styles.cardLink}>
            <Card>
              <div className={styles.courseCard}>
                <h2 className={styles.courseName}>{course.title}</h2>
                {course.description && <p className={styles.courseDesc}>{course.description}</p>}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
