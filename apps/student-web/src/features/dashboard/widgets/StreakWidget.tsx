import { Card } from '../../../components/common/Card';
import styles from './Widgets.module.css';

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakWidget({ currentStreak, longestStreak }: StreakWidgetProps) {
  return (
    <Card>
      <div className={styles.widget}>
        <span className={styles.widgetIcon} aria-hidden="true">🔥</span>
        <div className={styles.widgetContent}>
          <span className={styles.widgetValue}>{currentStreak}</span>
          <span className={styles.widgetLabel}>Day streak</span>
        </div>
        <span className={styles.widgetMeta}>Best: {longestStreak}</span>
      </div>
    </Card>
  );
}
