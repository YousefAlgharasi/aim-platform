import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import type { DailyChallengeSummary } from '../dashboardApi';
import styles from './Widgets.module.css';

interface ChallengeWidgetProps {
  challenge: DailyChallengeSummary;
}

/** Today's backend-assigned challenge (GET /student/engagement/summary → challenge). */
export function ChallengeWidget({ challenge }: ChallengeWidgetProps) {
  const target = Math.max(challenge.targetCount, 1);
  const pct = Math.min(100, Math.round((challenge.progressCount / target) * 100));
  return (
    <Card>
      <div className={styles.listWidget}>
        <div className={styles.headerRow}>
          <span className={styles.recType}>Daily challenge</span>
          <span className={challenge.completed ? styles.badgeSuccess : styles.widgetMeta}>
            {challenge.completed ? 'Completed' : `${challenge.progressCount}/${challenge.targetCount}`}
          </span>
        </div>
        <span className={styles.heroTitle}>{challenge.title}</span>
        <span className={styles.recReason}>{challenge.description}</span>
        <div
          className={styles.bar}
          role="progressbar"
          aria-label="Challenge progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
        {!challenge.completed && (
          <div className={styles.actionsRow}>
            <Link to="/curriculum" className={styles.viewAll}>Go to lessons</Link>
          </div>
        )}
      </div>
    </Card>
  );
}
