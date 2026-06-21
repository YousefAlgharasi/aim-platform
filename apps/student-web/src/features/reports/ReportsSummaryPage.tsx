import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Reports.module.css';

interface Stat {
  label: string;
  value: string;
}

interface SubjectProgress {
  name: string;
  percent: number;
}

interface ActivityEvent {
  date: string;
  event: string;
}

interface ReportData {
  stats: Stat[];
  subjectProgress: SubjectProgress[];
  recentActivity: ActivityEvent[];
}

export function ReportsSummaryPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchReport() {
    setLoading(true);
    setError('');
    apiClient.get<ReportData>('/api/reports/summary')
      .then(setData)
      .catch((err: ApiError) => setError(err.message || 'Failed to load reports'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchReport(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchReport} />;
  if (!data) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>My Reports</h1>

      <div className={styles.statsGrid}>
        {data.stats.map((stat, i) => (
          <Card key={i}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </Card>
        ))}
      </div>

      {data.subjectProgress.length > 0 && (
        <section className={styles.chartSection}>
          <h2 className={styles.subtitle}>Subject Progress</h2>
          <Card>
            <div className={styles.barChart}>
              {data.subjectProgress.map((sp, i) => (
                <div key={i} className={styles.barRow}>
                  <span className={styles.barLabel}>{sp.name}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${sp.percent}%` }}
                      role="progressbar"
                      aria-valuenow={sp.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${sp.name} progress`}
                    />
                  </div>
                  <span className={styles.barValue}>{sp.percent}%</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {data.recentActivity.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Recent Activity</h2>
          <Card>
            <div className={styles.timelineList}>
              {data.recentActivity.map((event, i) => (
                <div key={i} className={styles.timelineItem}>
                  <span className={styles.timelineDate}>
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className={styles.timelineEvent}>{event.event}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
