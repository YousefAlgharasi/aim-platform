import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAimResults } from './useAimResults';
import { dueLabel, formatInterval, humanize, prettifySkillId, type ReviewScheduleEntry } from './aimApi';
import styles from './AimPages.module.css';

function statusTone(status: string): string {
  switch (status.toLowerCase()) {
    case 'due':
      return styles.tonePrimary;
    case 'completed':
      return styles.toneSuccess;
    case 'rescheduled':
      return styles.toneWarning;
    default:
      return '';
  }
}

function ReviewList({ items }: { items: ReviewScheduleEntry[] }) {
  return (
    <div className={styles.list}>
      {items.map((r) => (
        <Card key={r.scheduleId}>
          <div className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle} title={r.skillId}>{prettifySkillId(r.skillId)}</span>
              <span className={`${styles.badge} ${statusTone(r.status)}`}>{humanize(r.status)}</span>
            </div>
            <span className={styles.due}>{dueLabel(r.dueAt)}</span>
            <p className={styles.meta}>
              Every {formatInterval(r.intervalDays)} · Reviewed {r.repetitionCount} time{r.repetitionCount === 1 ? '' : 's'}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Port of Flutter progress/ui/pages/review_schedule_page.dart + reviews/ui/pages/review_page.dart
 * (GET /aim/students/:id/review-schedules). Due dates/intervals are backend-computed.
 */
export function ReviewSchedulePage() {
  const { data, loading, error, reload } = useAimResults();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const open = data.reviewSchedules.filter((r) => r.status !== 'completed');
  const done = data.reviewSchedules.filter((r) => r.status === 'completed');

  return (
    <div className={styles.container}>
      <Link to="/progress" className={styles.backLink}>← Progress</Link>
      <h1 className={styles.heading}>Review schedule</h1>
      <p className={styles.intro}>Spaced-repetition reviews scheduled for you to keep skills fresh.</p>

      {data.reviewSchedules.length === 0 ? (
        <EmptyState title="No reviews scheduled" message="Reviews are scheduled automatically as you practice skills." />
      ) : (
        <>
          <section>
            <h2 className={styles.sectionTitle}>Upcoming</h2>
            {open.length === 0 ? <p className={styles.meta}>Nothing to review right now.</p> : <ReviewList items={open} />}
          </section>
          {done.length > 0 && (
            <section>
              <h2 className={styles.sectionTitle}>Completed</h2>
              <ReviewList items={done} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
