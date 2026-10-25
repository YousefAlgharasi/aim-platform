import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import type { EngagementStats } from '../dashboardApi';
import styles from './Widgets.module.css';

interface StatsWidgetProps {
  stats: EngagementStats | null;
}

/** XP, badges and rank from GET /student/engagement/stats (all backend-computed). */
export function StatsWidget({ stats }: StatsWidgetProps) {
  return (
    <Card>
      <div className={styles.statTriple}>
        <div className={styles.statCell}>
          <span className={styles.statCellValue}>{stats ? stats.totalXp.toLocaleString() : '—'}</span>
          <span className={styles.widgetLabel}>Total XP</span>
          {stats && stats.xpToday > 0 && <span className={styles.widgetMeta}>+{stats.xpToday} today</span>}
        </div>
        <Link to="/achievements" className={styles.statCell}>
          <span className={styles.statCellValue}>{stats ? stats.badgeCount : '—'}</span>
          <span className={styles.widgetLabel}>Badges</span>
        </Link>
        <div className={styles.statCell}>
          <span className={styles.statCellValue}>{stats ? `Top ${stats.rankPercentile}%` : '—'}</span>
          <span className={styles.widgetLabel}>Rank</span>
        </div>
      </div>
    </Card>
  );
}
