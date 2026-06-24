import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiError } from '../../types';
import styles from './DashboardHome.module.css';

interface DashboardData {
  progress: {
    completionPercent: number;
    currentStreak: number;
    lessonsCompleted: number;
  };
  recommendations: Array<{
    id: string;
    title: string;
    type: string;
  }>;
  deadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
  }>;
  activity: Array<{
    id: string;
    description: string;
    createdAt: string;
  }>;
}

export function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchDashboard() {
    setLoading(true);
    setError('');
    apiClient.get<DashboardData>('/students/me/dashboard')
      .then(setData)
      .catch((err: ApiError) => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <Card>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data.progress.completionPercent}%</span>
            <span className={styles.statLabel}>Completion</span>
          </div>
        </Card>
        <Card>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data.progress.currentStreak}</span>
            <span className={styles.statLabel}>Day streak</span>
          </div>
        </Card>
        <Card>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data.progress.lessonsCompleted}</span>
            <span className={styles.statLabel}>Lessons done</span>
          </div>
        </Card>
      </div>

      <section>
        <h2 className={styles.sectionTitle}>Recommended for you</h2>
        {data.recommendations.length === 0 ? (
          <EmptyState title="No recommendations" message="Check back later for personalized recommendations." />
        ) : (
          <div className={styles.list}>
            {data.recommendations.map(rec => (
              <Card key={rec.id}>
                <Link to={`/lessons/${rec.id}`} className={styles.recLink}>
                  <span className={styles.recType}>{rec.type}</span>
                  <span className={styles.recTitle}>{rec.title}</span>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Upcoming deadlines</h2>
        {data.deadlines.length === 0 ? (
          <EmptyState title="No deadlines" message="You have no upcoming deadlines." />
        ) : (
          <div className={styles.list}>
            {data.deadlines.map(d => (
              <Card key={d.id}>
                <div className={styles.deadline}>
                  <span>{d.title}</span>
                  <span className={styles.dueDate}>{new Date(d.dueDate).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Recent activity</h2>
        {data.activity.length === 0 ? (
          <EmptyState title="No activity" message="Start learning to see your activity here." />
        ) : (
          <div className={styles.list}>
            {data.activity.map(a => (
              <Card key={a.id}>
                <div className={styles.activityItem}>
                  <span>{a.description}</span>
                  <span className={styles.activityDate}>{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
