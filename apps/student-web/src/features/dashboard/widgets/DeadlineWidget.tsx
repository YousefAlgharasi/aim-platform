import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import styles from './Widgets.module.css';

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  type: string;
}

interface DeadlineWidgetProps {
  deadlines: Deadline[];
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
        <h3 className={styles.listTitle}>Upcoming deadlines</h3>
        <ul className={styles.deadlineList}>
          {deadlines.map(d => (
            <li key={d.id} className={styles.deadlineItem}>
              <div>
                <span className={styles.recType}>{d.type}</span>
                <span className={styles.recName}>{d.title}</span>
              </div>
              <span className={styles.deadlineDate}>
                {new Date(d.dueDate).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
