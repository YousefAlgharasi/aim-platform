import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { AcademicIcon, TrendingUpIcon, TrophyIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';
import { LevelBadge } from '../level/LevelBadge';
import { buildWeakSpots, categoryOf, CATEGORY_LABEL, type Category } from '../improve/ImprovePage';
import { useAimResults } from './useAimResults';
import { dueLabel, prettifySkillId, toPercent, type SkillStateEntry } from './aimApi';
import * as ui from './ui';

const OPEN_REVIEW = new Set(['due', 'pending', 'rescheduled']);

export interface AreaSummary { category: Category; percent: number; skills: number; trend: 'up' | 'down' | 'flat' }

/** Average mastery per skill type, with the direction most of its skills are moving. Pure, so it can be tested. */
export function summarizeAreas(skills: SkillStateEntry[]): AreaSummary[] {
  const groups = new Map<Category, SkillStateEntry[]>();
  for (const s of skills) groups.set(categoryOf(s.skillId), [...(groups.get(categoryOf(s.skillId)) ?? []), s]);
  return [...groups.entries()]
    .map(([category, list]) => {
      const up = list.filter((s) => s.masteryTrend === 'improving').length;
      const down = list.filter((s) => s.masteryTrend === 'declining').length;
      return {
        category,
        skills: list.length,
        percent: Math.round(list.reduce((n, s) => n + toPercent(s.masteryScore), 0) / list.length),
        trend: up > down ? 'up' as const : down > up ? 'down' as const : 'flat' as const,
      };
    })
    .sort((a, b) => a.percent - b.percent);
}

const TREND = { up: '↑', down: '↓', flat: '→' } as const;

function Ring({ percent, size = 128 }: { percent: number; size?: number }) {
  const c = 2 * Math.PI * 52;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" stroke="rgb(255 255 255 / 0.2)" />
        <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" strokeLinecap="round" stroke="white" strokeDasharray={`${(percent / 100) * c} ${c}`} />
      </svg>
      <span className="text-3xl font-semibold tabular-nums tracking-tight">{percent}%</span>
    </div>
  );
}

export function ProgressSummary() {
  const { t, plural } = useI18n();
  const { data, loading, error, reload } = useAimResults();
  const areas = useMemo(() => (data ? summarizeAreas(data.skillStates) : []), [data]);
  const spots = useMemo(() => (data ? buildWeakSpots(data) : []), [data]);

  if (loading) return <DetailSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { skillStates, reviewSchedules } = data;
  const avg = skillStates.length ? Math.round(skillStates.reduce((n, s) => n + toPercent(s.masteryScore), 0) / skillStates.length) : null;
  const strong = skillStates.filter((s) => s.masteryScore >= 0.8).length;
  const dueReviews = reviewSchedules
    .filter((r) => OPEN_REVIEW.has(r.status.toLowerCase()))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  const isEmpty = skillStates.length === 0 && spots.length === 0 && reviewSchedules.length === 0;

  const stat = (value: string | number, label: string) => (
    <div className="rounded-2xl bg-white/10 p-3">
      <span className="block text-2xl font-semibold tabular-nums tracking-tight">{value}</span>
      <span className="text-xs font-semibold text-on-brand">{label}</span>
    </div>
  );

  return (
    <div className="stagger flex flex-col gap-6">
      <PageTitleBar title={t('Progress')} subtitle={t('How your skills are growing, and what to do next.')} />

      {isEmpty ? (
        <EmptyState title={t('No progress yet')} message={t('Complete lessons and practice to see your skill mastery, weaknesses and review schedule here.')} />
      ) : (
        <>
          <section className="hero-panel" aria-label={t('Overall mastery')}>
            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
              {avg !== null ? <Ring percent={avg} /> : null}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><LevelBadge tone="onBrand" /></div>
                <p className="m-0 mt-2 text-xl font-semibold leading-snug sm:text-2xl">{avg !== null ? t('Overall mastery') : t('Not enough data yet')}</p>
                <p className="m-0 mt-1 text-sm text-on-brand">{t('Based on your lessons, practice and assessments.')}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {stat(skillStates.length, t('Skills tracked'))}
                  {stat(strong, t('Strong skills'))}
                  {stat(spots.length, t('To work on'))}
                  {stat(dueReviews.length, t('Reviews due'))}
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3" aria-label={t('Skills by area')}>
            <div className="flex items-center justify-between px-1">
              <h2 className={ui.sectionTitle}>{t('Skills by area')}</h2>
              <Link to="/progress/skills" className={ui.link}>{t('All skills')}</Link>
            </div>
            <Card>
              {areas.length === 0 ? (
                <p className={ui.muted}>{t('No skill mastery data yet.')}</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-4 p-0">
                  {areas.map((a) => (
                    <li key={a.category} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-ink">{t(CATEGORY_LABEL[a.category])}</span>
                        <span className="flex items-center gap-2 text-sm font-semibold tabular-nums text-ink">
                          <span aria-hidden="true" className={`text-xs ${a.trend === 'up' ? 'text-success-ink' : a.trend === 'down' ? 'text-danger-ink' : 'text-ink-muted'}`}>{TREND[a.trend]}</span>
                          {a.percent}%
                        </span>
                      </div>
                      <div className={ui.barTrack} role="progressbar" aria-label={t('{name} mastery', { name: t(CATEGORY_LABEL[a.category]) })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={a.percent}>
                        <div className={a.percent < 50 ? ui.barFillWeak : ui.barFill} style={{ width: `${Math.max(a.percent, 3)}%` }} />
                      </div>
                      <span className="text-xs text-ink-muted">{plural(a.skills, { one: t('{n} skill', { n: a.skills }), two: t('{n} skills [two]', { n: a.skills }), few: t('{n} skills [few]', { n: a.skills }), other: t('{n} skills', { n: a.skills }) })}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="flex flex-col gap-3" aria-label={t('Needs attention')}>
              <div className="flex items-center justify-between px-1">
                <h2 className={ui.sectionTitle}>{t('Needs attention')}</h2>
                <Link to="/improve" className={ui.link}>{t('Improve')}</Link>
              </div>
              <Card>
                {spots.length === 0 ? (
                  <p className={ui.muted}>{t('No open weaknesses. Keep it up!')}</p>
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {spots.slice(0, 4).map((s) => (
                      <li key={s.skillId}>
                        <Link to={s.lessonId ? `/practice/lesson/${encodeURIComponent(s.lessonId)}` : '/improve'} className="flex items-center justify-between gap-3 rounded-xl bg-surface-sunken p-3 no-underline transition-colors hover:bg-brand-soft">
                          <span className="min-w-0 truncate text-sm font-bold text-ink [unicode-bidi:plaintext]">{prettifySkillId(s.skillId)}</span>
                          {s.skill && <span className="shrink-0 text-xs font-semibold tabular-nums text-danger-ink">{toPercent(s.skill.masteryScore)}%</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </section>

            <section className="flex flex-col gap-3" aria-label={t('Review schedule')}>
              <div className="flex items-center justify-between px-1">
                <h2 className={ui.sectionTitle}>{t('Review schedule')}</h2>
                <Link to="/progress/reviews" className={ui.link}>{t('View all')}</Link>
              </div>
              <Card>
                {dueReviews.length === 0 ? (
                  <p className={ui.muted}>{t('Nothing to review right now.')}</p>
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {dueReviews.slice(0, 4).map((r) => (
                      <li key={r.scheduleId} className="flex items-center justify-between gap-3 rounded-xl bg-surface-sunken p-3">
                        <span className="min-w-0 truncate text-sm font-bold text-ink [unicode-bidi:plaintext]">{prettifySkillId(r.skillId)}</span>
                        <span className="shrink-0 text-xs font-semibold text-ink-muted">{dueLabel(r.dueAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </section>
          </div>
        </>
      )}

      <section className="flex flex-col gap-3" aria-label={t('More')}>
        <h2 className={`${ui.sectionTitle} px-1`}>{t('Your record')}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { to: '/achievements', text: 'Achievements', body: 'Badges you have earned', icon: <TrophyIcon className="size-6" /> },
            { to: '/certificates', text: 'Certificates', body: 'Proof of finished courses', icon: <AcademicIcon className="size-6" /> },
            { to: '/reports', text: 'Reports', body: 'Summaries of your activity', icon: <TrendingUpIcon className="size-6" /> },
          ].map((x) => (
            <Link key={x.to} to={x.to} className="group flex items-center gap-3 rounded-2xl bg-surface p-4 no-underline ring-1 ring-line transition-all hover:ring-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-strong text-ink" aria-hidden="true">{x.icon}</span>
              <span className="min-w-0"><span className="block text-sm font-semibold text-ink">{t(x.text)}</span><span className="block text-xs text-ink-muted">{t(x.body)}</span></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
