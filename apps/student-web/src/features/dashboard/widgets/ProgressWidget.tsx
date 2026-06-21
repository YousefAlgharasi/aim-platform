import { Card } from '../../../components/common/Card';
import styles from './Widgets.module.css';

interface ProgressWidgetProps {
  completionPercent: number;
  lessonsCompleted: number;
  totalLessons: number;
}

export function ProgressWidget({ completionPercent, lessonsCompleted, totalLessons }: ProgressWidgetProps) {
  return (
    <Card>
      <div className={styles.widget}>
        <div className={styles.progressRing}>
          <svg viewBox="0 0 36 36" className={styles.progressSvg}>
            <path
              className={styles.progressBg}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={styles.progressFill}
              strokeDasharray={`${completionPercent}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className={styles.progressPercent}>{completionPercent}%</span>
        </div>
        <div className={styles.widgetContent}>
          <span className={styles.widgetLabel}>Overall progress</span>
          <span className={styles.widgetMeta}>{lessonsCompleted}/{totalLessons} lessons</span>
        </div>
      </div>
    </Card>
  );
}
