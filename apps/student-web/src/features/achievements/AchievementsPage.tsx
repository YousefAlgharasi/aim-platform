import { PageTitleBar } from '../../components/common/PageTitleBar';
import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/client';
import { t } from '../../i18n';
import { fetchAchievements, type Achievement } from './achievementsApi';
import { TrophyIcon } from '../../components/common/Icons';

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

  if (loading) return <LoadingSpinner />;
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
          <div className="relative overflow-hidden rounded-3xl border border-brand-ink/20 bg-gradient-to-br from-brand via-brand to-secondary p-5 text-white shadow-xl shadow-brand/25">
            <div className="pointer-events-none absolute top-0 end-0 size-36 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10 flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-black/20 text-gold-on-brand backdrop-blur-md" aria-hidden="true">
                <TrophyIcon className="size-6" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-extrabold leading-tight">
                    {t('{done} of {total} badges unlocked', { done: unlocked.length, total: items.length })}
                  </span>
                  <span className="text-xs font-extrabold">{pct}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-black/20 p-0.5"
                  role="progressbar"
                  aria-label={t('Badges unlocked')}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                >
                  <div className="h-full rounded-full bg-gradient-to-r from-white to-brand-soft transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-1 rounded-xl bg-surface-strong/50 p-1 dark:bg-surface" role="tablist" aria-label={t('Filter achievements')}>
            {tabs.map((tb) => (
              <button
                key={tb.key}
                type="button"
                role="tab"
                aria-selected={tab === tb.key}
                className={`min-h-10 flex-1 cursor-pointer rounded-lg border-none px-2 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                  tab === tb.key
                    ? 'bg-surface-muted text-brand-ink shadow-sm'
                    : 'bg-transparent text-ink-muted hover:text-ink dark:hover:text-ink-soft'
                }`}
                onClick={() => setTab(tb.key)}
              >
                {tb.label}
              </button>
            ))}
          </div>

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
                  <Card className="h-full">
                    <div className="flex items-start gap-3.5">
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-2xl ${
                          a.unlocked
                            ? 'bg-brand-soft'
                            : 'bg-surface-muted'
                        }`}
                        aria-hidden="true"
                      >
                        {a.unlocked ? iconFor(a) : '🔒'}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-ink">
                          {humanize(a.category)}
                        </span>
                        <span className="text-sm font-bold text-ink">{a.title}</span>
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
