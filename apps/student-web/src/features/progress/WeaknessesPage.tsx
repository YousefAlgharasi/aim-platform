import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAimResults } from './useAimResults';
import { formatDate, humanize, prettifySkillId } from './aimApi';
import styles from './AimPages.module.css';

function severityTone(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return styles.toneError;
    case 'developing':
      return styles.toneWarning;
    default:
      return '';
  }
}

function statusTone(status: string): string {
  switch (status.toLowerCase()) {
    case 'open':
      return styles.toneError;
    case 'improving':
      return styles.toneWarning;
    case 'resolved':
      return styles.toneSuccess;
    default:
      return '';
  }
}

/** Port of Flutter progress/ui/pages/weakness_summary_page.dart (GET /aim/students/:id/weakness-records). */
export function WeaknessesPage() {
  const { data, loading, error, reload } = useAimResults();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  // Backend already orders unresolved first.
  const records = data.weaknessRecords;

  return (
    <div className={styles.container}>
      <Link to="/progress" className={styles.backLink}>← Progress</Link>
      <h1 className={styles.heading}>Areas to improve</h1>
      <p className={styles.intro}>Skills the AIM engine detected you are struggling with, based on your attempts.</p>

      {records.length === 0 ? (
        <EmptyState title="No weaknesses detected" message="Great work — no areas to improve have been detected yet." />
      ) : (
        <div className={styles.list}>
          {records.map((w) => (
            <Card key={w.weaknessId}>
              <div className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle} title={w.skillId}>{prettifySkillId(w.skillId)}</span>
                  <div className={styles.badges}>
                    <span className={`${styles.badge} ${severityTone(w.severity)}`}>{humanize(w.severity)}</span>
                    <span className={`${styles.badge} ${statusTone(w.status)}`}>{humanize(w.status)}</span>
                  </div>
                </div>
                <p className={styles.meta}>
                  Detected {formatDate(w.detectedAt)}
                  {w.resolvedAt ? ` · Resolved ${formatDate(w.resolvedAt)}` : ''}
                  {w.triggerAttemptIds.length > 0
                    ? ` · Based on ${w.triggerAttemptIds.length} attempt${w.triggerAttemptIds.length === 1 ? '' : 's'}`
                    : ''}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
