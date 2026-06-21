import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import styles from './Widgets.module.css';

interface Activity {
  id: string;
  description: string;
  createdAt: string;
}

interface ActivityWidgetProps {
  activities: Activity[];
}

export function ActivityWidget({ activities }: ActivityWidgetProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No activity yet"
          message="Start learning to see your activity here."
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className={styles.listWidget}>
        <h3 className={styles.listTitle}>Recent activity</h3>
        <ul className={styles.activityList}>
          {activities.map(a => (
            <li key={a.id} className={styles.activityItem}>
              <span>{a.description}</span>
              <span className={styles.activityDate}>
                {new Date(a.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
