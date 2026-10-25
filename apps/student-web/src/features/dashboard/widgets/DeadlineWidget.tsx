import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import type { StudentDeadlineItem } from '../dashboardApi';
import styles from './Widgets.module.css';

interface DeadlineWidgetProps {
  /** Backend-grouped deadlines; status is backend-derived and shown as-is. */
  deadlines: StudentDeadlineItem[];
}

const statusLabel: Record<string, string> = {
  upcoming: 'Upcoming',
  active: 'Open',
  late: 'Late',
  missed: 'Missed',
  closed: 'Closed',
};

function formatDue(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function DeadlineWidget({ deadlines }: DeadlineWidgetProps) {
  if (deadlines.length === 0) {
    return (
      <Card>
        <EmptyState title="No deadlines" message="You have no upcoming deadlines." />
      </Card>
    );
  }

  return (
    <Card>
      <div className={styles.listWidget}>
        <div className={styles.headerRow}>
          <h3 className={styles.listTitle}>Upcoming deadlines</h3>
          <Link to="/assessments" className={styles.viewAll}>All assessments</Link>
        </div>
        <ul className={styles.deadlineList}>
          {deadlines.map((d) => (
            <li key={d.deadlineId} className={styles.deadlineItem}>
              <Link to={`/assessments/${d.assessmentId}`} className={styles.recLink}>
                <span className={`${styles.recType} ${d.status === 'late' ? styles.toneWarning : ''}`}>
                  {statusLabel[d.status] ?? d.status}
                </span>
                <span className={styles.recName}>{d.assessmentTitle}</span>
              </Link>
              <span className={styles.deadlineDate}>
                {d.status === 'upcoming' ? `Opens ${formatDue(d.opensAt)}` : `Due ${formatDue(d.extendedClosesAt ?? d.closesAt)}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
