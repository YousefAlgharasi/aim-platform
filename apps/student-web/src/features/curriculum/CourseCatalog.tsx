import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiError } from '../../types';
import styles from './CourseCatalog.module.css';

interface Subject {
  id: string;
  name: string;
  description: string;
  unitCount: number;
  lessonCount: number;
  completionPercent: number;
}

export function CourseCatalog() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchSubjects() {
    setLoading(true);
    setError('');
    apiClient.get<{ subjects: Subject[] }>('/curriculum/subjects')
      .then(({ subjects: s }) => setSubjects(s))
      .catch((err: ApiError) => setError(err.message || 'Failed to load courses'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchSubjects(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchSubjects} />;
  if (subjects.length === 0) {
    return <EmptyState title="No courses available" message="Courses will appear here once they are published." />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Courses</h1>
      <div className={styles.grid}>
        {subjects.map(subject => (
          <Link key={subject.id} to={`/curriculum/${subject.id}`} className={styles.cardLink}>
            <Card>
              <div className={styles.courseCard}>
                <h2 className={styles.courseName}>{subject.name}</h2>
                <p className={styles.courseDesc}>{subject.description}</p>
                <div className={styles.courseMeta}>
                  <span>{subject.unitCount} units</span>
                  <span>{subject.lessonCount} lessons</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${subject.completionPercent}%` }}
                    role="progressbar"
                    aria-valuenow={subject.completionPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${subject.name} progress`}
                  />
                </div>
                <span className={styles.progressLabel}>{subject.completionPercent}% complete</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
