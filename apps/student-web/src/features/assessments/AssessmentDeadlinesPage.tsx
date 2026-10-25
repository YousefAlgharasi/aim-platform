import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  deadlineStatusLabel,
  fetchAssessmentDeadlines,
  type StudentDeadlineItem,
  type StudentDeadlines,
} from './assessmentsApi';
import { statusClass } from './assessmentUi';
import styles from './Assessment.module.css';

// Bucket order and titles follow the Flutter DeadlinesPage. Grouping is backend-computed.
const GROUPS: Array<{ key: keyof StudentDeadlines; title: string }> = [
  { key: 'active', title: 'Open now' },
  { key: 'late', title: 'Late submission window' },
  { key: 'upcoming', title: 'Upcoming' },
  { key: 'missed', title: 'Missed' },
  { key: 'closed', title: 'Closed' },
];

function DeadlineCard({ item }: { item: StudentDeadlineItem }) {
  const closesAt = item.extendedClosesAt ?? item.closesAt;
  return (
    <Link to={`/assessments/${item.assessmentId}`} className={styles.cardLink}>
      <Card>
        <div className={styles.assessmentCard}>
          <div className={styles.badgeRow}>
            <span className={`${styles.statusBadge} ${statusClass(item.status)}`}>{deadlineStatusLabel(item.status)}</span>
            {item.extendedClosesAt && <span className={styles.deadlineText}>Extended</span>}
          </div>
          <h2 className={styles.cardTitle}>{item.assessmentTitle}</h2>
          <div className={styles.cardMeta}>
            {item.status === 'upcoming' ? (
              <span>Opens {new Date(item.opensAt).toLocaleString()}</span>
            ) : (
              <span>
                {item.status === 'closed' || item.status === 'missed' || item.status === 'expired' ? 'Closed' : 'Due'}{' '}
                {new Date(closesAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function AssessmentDeadlinesPage() {
  const [deadlines, setDeadlines] = useState<StudentDeadlines | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAssessmentDeadlines()
      .then(setDeadlines)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load deadlines')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!deadlines) return null;

  const total = GROUPS.reduce((n, g) => n + deadlines[g.key].length, 0);

  return (
    <div className={styles.container}>
      <Link to="/assessments" className={styles.backLink}>← All assessments</Link>
      <h1 className={styles.heading}>Deadlines</h1>
      {total === 0 ? (
        <EmptyState title="No deadlines" message="You don't have any assessment deadlines right now." />
      ) : (
        GROUPS.filter((g) => deadlines[g.key].length > 0).map((g) => (
          <section key={g.key}>
            <h2 className={styles.subtitle}>{g.title}</h2>
            <div className={styles.list}>
              {deadlines[g.key].map((item) => (
                <DeadlineCard key={`${item.deadlineId}-${item.assessmentId}`} item={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
