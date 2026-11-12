import { PageTitleBar } from '../../components/common/PageTitleBar';
import { FilterPills } from '../../components/common/FilterPills';
import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { CardGridSkeleton } from '../../components/common/Skeleton';
import { getErrorMessage } from '../../api/client';
import { t } from '../../i18n';
import { fetchAchievements, type Achievement } from './achievementsApi';
import { useAuth } from '../../hooks/useAuth';
import { playSound } from '../../interaction';

const seenKey = (uid: string) => `aim-seen-badges:${uid}`;

/** Pure: unlocked badge keys not seen on this device yet. The first ever visit only records history (old badges are not "new"). */
export function pickNewBadges(items: Achievement[], seen: string[] | null): { fresh: string[]; all: string[] } {
  const all = items.filter((a) => a.unlocked).map((a) => a.key);
  if (seen === null) return { fresh: [], all };
  const known = new Set(seen);
  return { fresh: all.filter((k) => !known.has(k)), all };
}

type Tab = 'all' | 'unlocked' | 'locked';

function humanize(value: string): string {
  if (!value) return t('Other');
  const s = value.replace(/_/g, ' ');
  return t(s[0].toUpperCase() + s.slice(1));
}

/** Port of Flutter features/achievements (achievements_page.dart). */
export function AchievementsPage() {
  const { t, formatDate } = useI18n();
  const [items, setItems] = useState<Achievement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const { user } = useAuth();
  const uid = user?.id;
  const [fresh, setFresh] = useState<string[]>([]);

  // Badges unlocked since the last visit get a one-time reveal; remembered per learner on this device.
  useEffect(() => {
    if (!uid || !items) return;
    let seen: string[] | null = null;
    try { const raw = localStorage.getItem(seenKey(uid)); seen = raw ? (JSON.parse(raw) as string[]) : null; } catch { seen = null; }
    const picked = pickNewBadges(items, seen);
    try { localStorage.setItem(seenKey(uid), JSON.stringify(picked.all)); } catch { /* per-device convenience only */ }
    if (picked.fresh.length > 0) {
      setFresh(picked.fresh);
      playSound('achievement');
    }
  }, [uid, items]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await fetchAchievements());
    } catch (err) {
      setError(getErrorMessage(err, t('Could not load your achievements.')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <CardGridSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items) return null;

  const unlocked = items.filter((a) => a.unlocked);
  const locked = items.filter((a) => !a.unlocked);
  const visible = tab === 'unlocked' ? unlocked : tab === 'locked' ? locked : items;
  const pct = items.length === 0 ? 0 : Math.round((unlocked.length / items.length) * 100);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: t('All ({n})', { n: items.length }) },
    { key: 'unlocked', label: t('Unlocked ({n})', { n: unlocked.length }) },
    { key: 'locked', label: t('Locked ({n})', { n: locked.length }) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageTitleBar title={t('Achievements')} />

      {items.length === 0 ? (
        <EmptyState title={t('No achievements yet')} message={t('Achievements will appear here as they become available.')} />
      ) : (
        <>
          <div className="hero-panel">
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-semibold leading-tight">
                    {t('{done} of {total} badges unlocked', { done: unlocked.length, total: items.length })}
                  </span>
                  <span className="text-xs font-semibold">{pct}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-white/25"
                  role="progressbar"
                  aria-label={t('Badges unlocked')}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                >
                  <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {fresh.length > 0 && (
            <p role="status" className="ix-fade-up m-0 rounded-2xl bg-surface p-4 text-base font-semibold text-ink ring-1 ring-gold">
              {fresh.length === 1
                ? t('New badge unlocked: {title}', { title: items.find((a) => a.key === fresh[0])?.title ?? '' })
                : t('{n} new badges unlocked', { n: fresh.length })}
            </p>
          )}

          <FilterPills label={t('Filter achievements')} value={tab} onChange={setTab} options={tabs.map((tb) => ({ key: tb.key, label: tb.label }))} />

          {visible.length === 0 ? (
            <EmptyState
              title={tab === 'unlocked' ? t('Nothing unlocked yet') : t('All unlocked!')}
              message={
                tab === 'unlocked'
                  ? t('Complete lessons and keep your streak going to unlock badges.')
                  : t('You have unlocked every available badge.')
              }
            />
          ) : (
            <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((a) => (
                <li key={a.key}>
                  <Card className={`h-full ${fresh.includes(a.key) ? 'ix-reveal ix-sheen !ring-gold' : ''}`}>
                    <div className="flex items-start gap-3.5">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-xs font-semibold text-brand-ink">
                          {humanize(a.category)}
                        </span>
                        <span className="text-sm font-bold text-ink">
                          {a.title}
                          {fresh.includes(a.key) && <span className="ms-2 rounded-full px-2 py-0.5 text-[11px] font-bold text-ink ring-1 ring-gold">{t('New')}</span>}
                        </span>
                        <span className="text-xs leading-relaxed text-ink-muted">{a.description}</span>
                        <span
                          className={`mt-1 self-start rounded-md px-2 py-0.5 text-xs font-bold ${
                            a.unlocked
                              ? 'bg-success-soft text-success-ink'
                              : 'bg-surface-muted text-ink-muted'
                          }`}
                        >
                          {a.unlocked
                            ? a.unlockedAt
                              ? t('Unlocked {date}', { date: formatDate(a.unlockedAt) })
                              : t('Unlocked')
                            : t('Locked')}
                        </span>
                      </div>
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
