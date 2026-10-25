import { useCallback, useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/client';
import { fetchAchievements, type Achievement } from './achievementsApi';
import styles from './Achievements.module.css';

type Tab = 'all' | 'unlocked' | 'locked';

// Backend icons are Material icon names; map the known ones to emoji for the web.
const ICONS: Record<string, string> = {
  emoji_events: '🏆',
  local_fire_department: '🔥',
  workspace_premium: '🏅',
  school: '🎓',
  star: '⭐',
  bolt: '⚡',
  military_tech: '🎖️',
};

function iconFor(a: Achievement): string {
  return ICONS[a.icon] ?? '⭐';
}

function humanize(value: string): string {
  if (!value) return 'Other';
  const s = value.replace(/_/g, ' ');
  return s[0].toUpperCase() + s.slice(1);
}

/** Port of Flutter features/achievements (achievements_page.dart). */
export function AchievementsPage() {
  const [items, setItems] = useState<Achievement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await fetchAchievements());
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your achievements.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items) return null;

  const unlocked = items.filter((a) => a.unlocked);
  const locked = items.filter((a) => !a.unlocked);
  const visible = tab === 'unlocked' ? unlocked : tab === 'locked' ? locked : items;
  const pct = items.length === 0 ? 0 : Math.round((unlocked.length / items.length) * 100);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: `All (${items.length})` },
    { key: 'unlocked', label: `Unlocked (${unlocked.length})` },
    { key: 'locked', label: `Locked (${locked.length})` },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Achievements</h1>

      {items.length === 0 ? (
        <EmptyState title="No achievements yet" message="Achievements will appear here as they become available." />
      ) : (
        <>
          <Card>
            <div className={styles.summary}>
              <span className={styles.summaryIcon} aria-hidden="true">🏆</span>
              <div className={styles.summaryText}>
                <span className={styles.summaryValue}>
                  {unlocked.length} of {items.length} badges unlocked
                </span>
                <div
                  className={styles.bar}
                  role="progressbar"
                  aria-label="Badges unlocked"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                >
                  <div className={styles.barFill} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          </Card>

          <div className={styles.tabs} role="tablist" aria-label="Filter achievements">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState
              title={tab === 'unlocked' ? 'Nothing unlocked yet' : 'All unlocked!'}
              message={
                tab === 'unlocked'
                  ? 'Complete lessons and keep your streak going to unlock badges.'
                  : 'You have unlocked every available badge.'
              }
            />
          ) : (
            <ul className={styles.grid}>
              {visible.map((a) => (
                <li key={a.key}>
                  <Card className={a.unlocked ? '' : styles.lockedCard}>
                    <div className={styles.badge}>
                      <span className={styles.badgeIcon} aria-hidden="true">
                        {a.unlocked ? iconFor(a) : '🔒'}
                      </span>
                      <span className={styles.badgeCategory}>{humanize(a.category)}</span>
                      <span className={styles.badgeTitle}>{a.title}</span>
                      <span className={styles.badgeDesc}>{a.description}</span>
                      <span className={a.unlocked ? styles.badgeUnlocked : styles.badgeLocked}>
                        {a.unlocked
                          ? a.unlockedAt
                            ? `Unlocked ${new Date(a.unlockedAt).toLocaleDateString()}`
                            : 'Unlocked'
                          : 'Locked'}
                      </span>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
