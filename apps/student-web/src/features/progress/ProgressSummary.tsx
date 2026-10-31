import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { fetchEngagementSummary, type DailyGoalSummary } from '../dashboard/dashboardApi';
import { useI18n } from '../../i18n/I18nContext';
import { useAimResults } from './useAimResults';
import { dueLabel, humanize, masteryTier, prettifySkillId, tierLabel, toPercent } from './aimApi';
import * as ui from './ui';
import { FlameIcon } from '../../components/common/Icons';

const OPEN_WEAKNESS_STATUSES = new Set(['open', 'improving']);
const OPEN_REVIEW_STATUSES = new Set(['due', 'pending', 'rescheduled']);

export function ProgressSummary() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useAimResults();
  // Day streak is supplementary (Flutter reads it from the Home engagement summary);
  // its failure must not block the AIM data.
  const [goal, setGoal] = useState<DailyGoalSummary | null>(null);

  useEffect(() => {
    fetchEngagementSummary()
      .then((s) => setGoal(s?.goal ?? null))
      .catch(() => setGoal(null));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { skillStates, weaknessRecords, reviewSchedules, recommendations } = data;
  const isEmpty =
    skillStates.length === 0 &&
    weaknessRecords.length === 0 &&
    reviewSchedules.length === 0 &&
    recommendations.length === 0;

  const avgMastery =
    skillStates.length > 0
      ? Math.round(skillStates.reduce((sum, s) => sum + toPercent(s.masteryScore), 0) / skillStates.length)
      : null;
  const openWeaknesses = weaknessRecords.filter((w) => OPEN_WEAKNESS_STATUSES.has(w.status.toLowerCase()));
  const openReviews = reviewSchedules
    .filter((r) => OPEN_REVIEW_STATUSES.has(r.status.toLowerCase()))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  const topSkills = [...skillStates].sort((a, b) => b.masteryScore - a.masteryScore).slice(0, 5);

  const tile = (value: string | number, label: string, icon?: React.ReactNode) => (
    <Card>
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {icon}
          {value}
        </span>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      </div>
    </Card>
  );

  const header = (title: string, to: string) => (
    <div className="flex items-center justify-between px-1">
      <h2 className={ui.sectionTitle}>{title}</h2>
      <Link to={to} className={ui.link}>{t('View all')}</Link>
    </div>
  );

  return (
    <div className={ui.pageStack}>
      <h1 className={ui.h1}>{t('Progress')}</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tile(skillStates.length, t('Skills tracked'))}
        {tile(avgMastery == null ? '—' : `${avgMastery}%`, t('Average mastery'))}
        {tile(openReviews.length, t('Reviews scheduled'))}
        {tile(goal ? goal.streakDays : '—', t('Day streak'), <FlameIcon className="size-5 text-amber-400 fill-amber-400" />)}
      </div>

      {isEmpty ? (
        <EmptyState
          title={t('No progress yet')}
          message={t('Complete lessons and practice to see your skill mastery, weaknesses and review schedule here.')}
        />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            {header(t('Skills'), '/progress/skills')}
            {topSkills.length === 0 ? (
              <Card><p className={ui.muted}>{t('No skill mastery data yet.')}</p></Card>
            ) : (
              <Card>
                <div className="flex flex-col gap-4">
                  {topSkills.map((s) => {
                    const pct = toPercent(s.masteryScore);
                    return (
                      <div key={s.skillId} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{prettifySkillId(s.skillId)}</span>
                          <span className={ui.badge(ui.tone.primary)}>{t(tierLabel[masteryTier(s.masteryScore)])}</span>
                        </div>
                        <div
                          className={ui.barTrack}
                          role="progressbar"
                          aria-label={t('{name} mastery', { name: prettifySkillId(s.skillId) })}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={pct}
                        >
                          <div className={ui.barFill} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span>{t('Mastery {pct}%', { pct })}</span>
                          <span>{t('Confidence {pct}%', { pct: toPercent(s.masteryConfidence) })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="flex flex-col gap-3">
              {header(t('Areas to improve'), '/progress/weaknesses')}
              <Card>
                {openWeaknesses.length === 0 ? (
                  <p className={ui.muted}>{t('No open weaknesses. Keep it up!')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {openWeaknesses.slice(0, 8).map((w) => (
                      <span key={w.weaknessId} className={ui.badge(ui.tone.warning)}>
                        {prettifySkillId(w.skillId)} · {humanize(w.severity)}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </section>

            <section className="flex flex-col gap-3">
              {header(t('Review schedule'), '/progress/reviews')}
              <Card>
                {openReviews.length === 0 ? (
                  <p className={ui.muted}>{t('Nothing to review right now.')}</p>
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-3 p-0">
                    {openReviews.slice(0, 4).map((r) => (
                      <li key={r.scheduleId} className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{prettifySkillId(r.skillId)}</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{dueLabel(r.dueAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </section>
          </div>

          <section className="flex flex-col gap-3">
            {header(t('Recommendations'), '/progress/recommendations')}
            <Card>
              {recommendations.length === 0 ? (
                <p className={ui.muted}>{t('No recommendations right now.')}</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                  {recommendations.slice(0, 3).map((r) => (
                    <li key={r.id} className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {humanize(r.kind)} · {prettifySkillId(r.targetSkillId)}
                      </span>
                      <span>{humanize(r.reason)}</span>
                      {r.targetLessonId && (
                        <Link to={`/lessons/${r.targetLessonId}`} className={ui.link}>{t('Open lesson')}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </>
      )}

      <section className="flex flex-col gap-3">
        <h2 className={`${ui.sectionTitle} px-1`}>{t('More')}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ['/achievements', 'Achievements'],
            ['/certificates', 'Certificates'],
            ['/reports', 'Reports'],
          ].map(([to, text]) => (
            <Link
              key={to}
              to={to}
              className="block rounded-2xl text-sm font-bold text-slate-900 no-underline transition-all hover:-translate-y-0.5 dark:text-white [&>div]:h-full [&>div]:hover:ring-indigo-300"
            >
              <Card>{t(text)}</Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
