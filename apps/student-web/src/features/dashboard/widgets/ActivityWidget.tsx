import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import type { WeeklyActivityDay } from '../dashboardApi';
import styles from './Widgets.module.css';

interface ActivityWidgetProps {
  /** Mon–Sun of the current UTC week, from GET /student/engagement/stats. */
  days: WeeklyActivityDay[];
  weeklyDeltaPercent?: number | null;
}

function dayLabel(date: string): string {
  // date is yyyy-mm-dd (UTC); render the weekday without shifting time zones.
  const d = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' });
}

export function ActivityWidget({ days, weeklyDeltaPercent }: ActivityWidgetProps) {
  const total = days.reduce((sum, d) => sum + d.xp, 0);

  if (days.length === 0 || total === 0) {
    return (
      <Card>
        <EmptyState title="No activity this week" message="Complete a lesson to earn XP and fill your week." />
      </Card>
    );
  }

  const max = Math.max(...days.map((d) => d.xp), 1);

  return (
    <Card>
      <div className={styles.listWidget}>
        <div className={styles.headerRow}>
          <h3 className={styles.listTitle}>This week</h3>
          <span className={styles.widgetMeta}>
            {total} XP
            {weeklyDeltaPercent != null &&
              ` · ${weeklyDeltaPercent >= 0 ? '+' : ''}${weeklyDeltaPercent}% vs last week`}
          </span>
        </div>
        <ul className={styles.weekChart} aria-label="XP earned per day this week">
          {days.map((d) => (
            <li key={d.date} className={styles.weekDay}>
              <span className={styles.weekValue}>{d.xp > 0 ? d.xp : ''}</span>
              <div className={styles.weekTrack}>
                <div
                  className={styles.weekBar}
                  style={{ height: `${Math.round((d.xp / max) * 100)}%` }}
                  role="img"
                  aria-label={`${dayLabel(d.date)}: ${d.xp} XP`}
                />
              </div>
              <span className={styles.activityDate}>{dayLabel(d.date)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
