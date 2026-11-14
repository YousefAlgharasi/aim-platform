import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { useI18n } from '../../i18n/I18nContext';
import { LevelBadge } from '../level/LevelBadge';
import { buildWeakSpots, type WeakSpot, categoryOf, CATEGORY_LABEL, type Category } from '../improve/ImprovePage';
import { useAimResults } from './useAimResults';
import { dueLabel, prettifySkillId, toPercent, type ReviewScheduleEntry, type SkillStateEntry } from './aimApi';
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

export interface NextItem { skillId: string; kind: 'work' | 'review'; href: string; percent: number | null; dueAt: string | null; severity: WeakSpot['severity'] | null }

/** One ordered "do next" list: shaky skills that are also due first, then due reviews, then the other shaky skills. Pure, so it can be tested. */
export function buildNextItems(spots: WeakSpot[], dueReviews: ReviewScheduleEntry[]): NextItem[] {
  const dueBySkill = new Map(dueReviews.map((r) => [r.skillId, r]));
  const work = (s: WeakSpot): NextItem => ({
    skillId: s.skillId,
    kind: 'work',
    href: s.lessonId ? `/practice/lesson/${encodeURIComponent(s.lessonId)}` : '/improve',
    percent: s.skill ? toPercent(s.skill.masteryScore) : null,
    dueAt: dueBySkill.get(s.skillId)?.dueAt ?? null,
    severity: s.severity,
  });
  const spotIds = new Set(spots.map((s) => s.skillId));
  const both = spots.filter((s) => dueBySkill.has(s.skillId)).map(work);
  const reviewsOnly: NextItem[] = dueReviews
    .filter((r) => !spotIds.has(r.skillId))
    .map((r) => ({ skillId: r.skillId, kind: 'review', href: '/progress/reviews', percent: null, dueAt: r.dueAt, severity: null }));
  const rest = spots.filter((s) => !dueBySkill.has(s.skillId)).map(work);
  return [...both, ...reviewsOnly, ...rest];
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
  const dueReviews = reviewSchedules
    .filter((r) => OPEN_REVIEW.has(r.status.toLowerCase()))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  const isEmpty = skillStates.length === 0 && spots.length === 0 && reviewSchedules.length === 0;

  const items = buildNextItems(spots, dueReviews);
  const next = items[0];
  const improving = skillStates
    .filter((s) => s.masteryTrend === 'improving')
    .sort((a, b) => b.masteryScore - a.masteryScore)
    .slice(0, 3);

  const verb = (i: NextItem) => (i.kind === 'review' ? t('Review {skill}', { skill: prettifySkillId(i.skillId) }) : t('Practice {skill}', { skill: prettifySkillId(i.skillId) }));
  const reason = (i: NextItem) =>
    i.kind === 'review'
      ? t('A review is due. A short refresh now helps you remember it.')
      : i.dueAt
        ? t('This skill is weak and its review is due.')
        : i.severity === 'critical'
          ? t('This is your weakest skill right now.')
          : t('A little practice here will lift your overall score.');

  return (
    <div className="stagger flex flex-col gap-6">
      <PageTitleBar title={t('Progress')} />

      {isEmpty ? (
        <EmptyState title={t('No progress yet')} message={t('Complete lessons and practice to see your skill mastery, weaknesses and review schedule here.')} />
      ) : (
        <>
          <section data-tour="progress-next" className="hero-panel" aria-label={t('Your next step')}>
            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
              {avg !== null ? <Ring percent={avg} /> : null}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><LevelBadge tone="onBrand" /></div>
                <p className="m-0 mt-2 text-sm text-on-brand">{avg !== null ? t('Overall mastery {n}%', { n: avg }) : t('Not enough data yet')}</p>
                <p className="m-0 mt-1 text-xl font-semibold leading-snug [unicode-bidi:plaintext] sm:text-2xl">{next ? verb(next) : t("You're on track")}</p>
                <p className="m-0 mt-1 max-w-prose text-sm text-on-brand">{next ? reason(next) : t('Nothing is weak or due. Keep going with your course.')}</p>
                <div className="mt-4">
                  <Link
                    to={next ? next.href : '/curriculum'}
                    className="inline-flex h-12 items-center justify-center rounded-2xl hero-cta px-6 text-[15px] font-bold no-underline transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand motion-reduce:transition-none"
                  >
                    {next ? (next.kind === 'review' ? t('Review now') : t('Practice now')) : t('Continue learning')}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {improving.length > 0 && (
            <p className="m-0 px-1 text-sm text-ink-muted">
              <span className="font-semibold text-success-ink">{t('Going up lately:')}</span>{' '}
              <span className="[unicode-bidi:plaintext]">{improving.map((s) => prettifySkillId(s.skillId)).join(', ')}</span>
            </p>
          )}

          {items.length > 1 && (
            <section className="flex flex-col gap-3" aria-label={t('Then')}>
              <div className="flex items-center justify-between px-1">
                <h2 className={ui.sectionTitle}>{t('Then')}</h2>
                <Link to="/progress/reviews" className={ui.link}>{t('All reviews')}</Link>
              </div>
              <Card>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {items.slice(1, 5).map((i) => (
                    <li key={i.skillId}>
                      <Link to={i.href} className="flex items-center justify-between gap-3 rounded-xl bg-surface-sunken p-3 no-underline transition-colors hover:bg-brand-soft motion-reduce:transition-none">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-ink [unicode-bidi:plaintext]">{prettifySkillId(i.skillId)}</span>
                          <span className="block text-xs text-ink-muted">{i.kind === 'review' ? t('Review') : t('Practice')}{i.dueAt ? `, ${dueLabel(i.dueAt)}` : ''}</span>
                        </span>
                        {i.percent !== null && <span className="shrink-0 text-xs font-semibold tabular-nums text-danger-ink">{i.percent}%</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          <section data-tour="progress-skills" className="flex flex-col gap-3" aria-label={t('Skills by area')}>
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
        </>
      )}
    </div>
  );
}
