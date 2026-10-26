import { Link } from 'react-router-dom';
import * as ui from './ui';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useI18n } from '../../i18n/I18nContext';
import { useAimResults } from './useAimResults';
import { masteryTier, prettifySkillId, tierLabel, toPercent, trendLabel } from './aimApi';

const OPEN_WEAKNESS_STATUSES = new Set(['open', 'improving']);

export function SkillStatePage() {
  const { t, formatDate } = useI18n();
  const { data, loading, error, reload } = useAimResults();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  // Backend order is preserved (Flutter never reorders AIM output).
  const skills = data.skillStates;
  const weakSkillIds = new Set(
    data.weaknessRecords
      .filter((w) => OPEN_WEAKNESS_STATUSES.has(w.status.toLowerCase()))
      .map((w) => w.skillId),
  );

  return (
    <div className={ui.pageStack}>
      <ui.BackLink to="/progress">{t('Progress')}</ui.BackLink>
      <h1 className={ui.h1}>{t('Skills')}</h1>

      {skills.length === 0 ? (
        <EmptyState
          title={t('No skill data yet')}
          message={t('Your skill mastery appears here after you complete lessons, practice or assessments.')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {skills.map((s) => {
            const pct = toPercent(s.masteryScore);
            const tier = masteryTier(s.masteryScore);
            const prev = s.previousMasteryScore != null ? toPercent(s.previousMasteryScore) : null;
            const name = prettifySkillId(s.skillId);
            return (
              <Card key={s.skillId}>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-bold text-slate-900 dark:text-white [overflow-wrap:anywhere]" title={s.skillId}>{name}</span>
                    <span className={ui.badge(tier === 'needsWork' || weakSkillIds.has(s.skillId) ? ui.tone.error : ui.tone.primary)}>
                      {t(tierLabel[tier])}
                    </span>
                  </div>
                  <div
                    className={ui.barTrack}
                    role="progressbar"
                    aria-label={t('{name} mastery', { name })}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                  >
                    <div className={tier === 'needsWork' ? ui.barFillWeak : ui.barFill} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t('Mastery {pct}%', { pct })}{prev != null ? ` · ${t('was {pct}%', { pct: prev })}` : ''}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{trendLabel(s.masteryTrend)}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t('Confidence {pct}%', { pct: toPercent(s.masteryConfidence) })} ·{' '}
                    {t('Last evaluated {date}', { date: formatDate(s.lastEvaluatedAt) })}
                  </span>
                  {weakSkillIds.has(s.skillId) && (
                    <p className="m-0 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 [&_a]:font-semibold [&_a]:text-[#4F46E5] dark:[&_a]:text-indigo-400">
                      {t('This skill is flagged as an area to improve.')} <Link to="/progress/weaknesses">{t('See details')}</Link>
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
