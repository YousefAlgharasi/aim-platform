import { Card } from '../../../components/common/Card';
import styles from './Widgets.module.css';

interface ProgressWidgetProps {
  completionPercent: number;
  label: string;
  meta?: string;
}

export function ProgressWidget({ completionPercent, label, meta }: ProgressWidgetProps) {
  const pct = Math.min(100, Math.max(0, Math.round(completionPercent)));
  return (
    <Card>
      <div className={styles.widget}>
        <div className={styles.progressRing}>
          <svg viewBox="0 0 36 36" className={styles.progressSvg} aria-hidden="true">
            <path
              className={styles.progressBg}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={styles.progressFill}
              strokeDasharray={`${pct}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className={styles.progressPercent}>{pct}%</span>
        </div>
        <div className={styles.widgetContent}>
          <span className={styles.widgetLabel}>{label}</span>
          {meta && <span className={styles.widgetMeta}>{meta}</span>}
        </div>
      </div>
    </Card>
  );
}
