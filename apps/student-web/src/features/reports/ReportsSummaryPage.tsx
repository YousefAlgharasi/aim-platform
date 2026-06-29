import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiError } from '../../types';
import styles from './Reports.module.css';

interface ReportDefinition {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
}

export function ReportsSummaryPage() {
  const [reports, setReports] = useState<ReportDefinition[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchReports() {
    setLoading(true);
    setError('');
    apiClient.get<ReportDefinition[]>('/student/analytics/summary')
      .then(setReports)
      .catch((err: ApiError) => setError(err.message || 'Failed to load reports'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchReports(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchReports} />;
  if (!reports) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>My Reports</h1>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports available"
          message="There are no reports available to you yet."
        />
      ) : (
        <div className={styles.timelineList}>
          {reports.map((report) => (
            <Card key={report.id}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>{report.name}</span>
                {report.description && <p>{report.description}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
