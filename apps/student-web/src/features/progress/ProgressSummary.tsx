import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './ProgressSummary.module.css';

interface ProgressData {
  mastery: number;
  completion: number;
  streak: number;
  lessonsCompleted: number;
  totalLessons: number;
  subjectProgress: Array<{
    id: string;
    name: string;
    mastery: number;
    completion: number;
  }>;
}

export function ProgressSummary() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchProgress() {
    setLoading(true);
    setError('');
    apiClient.get<ProgressData>('/api/students/me/progress')
      .then(setData)
      .catch((err: ApiError) => setError(err.message || 'Failed to load progress'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchProgress(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchProgress} />;
  if (!data) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Progress</h1>

      <div className={styles.statsRow}>
        <Card>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data.mastery}%</span>
            <span className={styles.statLabel}>Mastery</span>
          </div>
        </Card>
        <Card>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data.completion}%</span>
            <span className={styles.statLabel}>Completion</span>
          </div>
        </Card>
        <Card>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data.streak}</span>
            <span className={styles.statLabel}>Day streak</span>
          </div>
        </Card>
        <Card>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data.lessonsCompleted}/{data.totalLessons}</span>
            <span className={styles.statLabel}>Lessons</span>
          </div>
        </Card>
      </div>

      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>By subject</h2>
          <Link to="/progress/skills" className={styles.viewAll}>View skills</Link>
        </div>
        <div className={styles.subjectList}>
          {data.subjectProgress.map(subject => (
            <Card key={subject.id}>
              <div className={styles.subjectItem}>
                <span className={styles.subjectName}>{subject.name}</span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${subject.completion}%` }}
                    role="progressbar"
                    aria-valuenow={subject.completion}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${subject.name} progress`}
                  />
                </div>
                <div className={styles.subjectStats}>
                  <span>Mastery: {subject.mastery}%</span>
                  <span>Completion: {subject.completion}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
