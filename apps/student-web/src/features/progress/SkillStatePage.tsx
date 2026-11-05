import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ListSkeleton } from '../../components/common/Skeleton';
import { useI18n } from '../../i18n/I18nContext';
import { categoryOf, CATEGORY_LABEL, type Category } from '../improve/ImprovePage';
import { useAimResults } from './useAimResults';
import { masteryTier, prettifySkillId, tierLabel, toPercent, trendLabel } from './aimApi';
import * as ui from './ui';

const OPEN = new Set(['open', 'improving']);
const TREND_MARK: Record<string, string> = { improving: '↑', declining: '↓', stable: '→' };

export function SkillStatePage() {
  const { t, formatDate } = useI18n();
  const { data, loading, error, reload } = useAimResults();
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [weakFirst, setWeakFirst] = useState(true);

  const skills = useMemo(() => {
    const list = data ? (cat === 'all' ? data.skillStates : data.skillStates.filter((s) => categoryOf(s.skillId) === cat)) : [];
    return [...list].sort((a, b) => (weakFirst ? a.masteryScore - b.masteryScore : b.masteryScore - a.masteryScore));
  }, [data, cat, weakFirst]);

  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const weakIds = new Set(data.weaknessRecords.filter((w) => OPEN.has(w.status.toLowerCase())).map((w) => w.skillId));
  const cats = [...new Set(data.skillStates.map((s) => categoryOf(s.skillId)))];

  return (
    <div className={`${ui.pageStack} stagger`}>
      <PageTitleBar title={t('Skills')} subtitle={t('Every skill we track for you, with how well you know it.')} fallback="/progress" />

      {data.skillStates.length === 0 ? (
        <EmptyState title={t('No skill data yet')} message={t('Your skill mastery appears here after you complete lessons, practice or assessments.')} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t('Filter by skill type')}>
              {(['all', ...cats] as Array<Category | 'all'>).map((c) => (
                <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
                  className={`min-h-10 shrink-0 cursor-pointer rounded-full border-0 px-4 text-sm font-bold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${cat === c ? 'bg-brand text-white ring-brand' : 'bg-surface text-ink-soft ring-line hover:bg-brand-soft'}`}>
                  {c === 'all' ? t('All') : t(CATEGORY_LABEL[c])}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setWeakFirst((v) => !v)} className="min-h-10 cursor-pointer rounded-xl border-0 bg-control px-4 text-sm font-bold text-ink-soft hover:bg-brand-soft hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              {weakFirst ? t('Weakest first') : t('Strongest first')}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {skills.map((s) => {
              const pct = toPercent(s.masteryScore);
              const tier = masteryTier(s.masteryScore);
              const name = prettifySkillId(s.skillId);
              const weak = weakIds.has(s.skillId);
              return (
                <Card key={s.skillId}>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="m-0 text-base font-extrabold leading-snug text-ink [overflow-wrap:anywhere] [unicode-bidi:plaintext]" title={s.skillId}>{name}</p>
                        <p className="m-0 mt-0.5 text-xs text-ink-muted">{t(CATEGORY_LABEL[categoryOf(s.skillId)])}</p>
                      </div>
                      <span className={ui.badge(tier === 'strong' ? ui.tone.success : tier === 'developing' ? ui.tone.primary : ui.tone.error)}>{t(tierLabel[tier])}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`${ui.barTrack} flex-1`} role="progressbar" aria-label={t('{name} mastery', { name })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                        <div className={tier === 'needsWork' ? ui.barFillWeak : ui.barFill} style={{ width: `${Math.max(pct, 3)}%` }} />
                      </div>
                      <span className="w-12 text-end text-sm font-extrabold tabular-nums text-ink">{pct}%</span>
                    </div>
                    <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-ink-muted">
                      <span><span aria-hidden="true" className={s.masteryTrend === 'improving' ? 'text-success-ink' : s.masteryTrend === 'declining' ? 'text-danger-ink' : ''}>{TREND_MARK[s.masteryTrend] ?? ''}</span> {trendLabel(s.masteryTrend)}</span>
                      <span>{t('Confidence {pct}%', { pct: toPercent(s.masteryConfidence) })}</span>
                      <span>{t('Last evaluated {date}', { date: formatDate(s.lastEvaluatedAt) })}</span>
                    </p>
                    {weak && (
                      <Link to="/improve" className="rounded-xl bg-warning-soft px-3 py-2 text-xs font-bold text-warning-ink no-underline hover:underline">
                        {t('This skill is flagged as an area to improve.')} →
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
