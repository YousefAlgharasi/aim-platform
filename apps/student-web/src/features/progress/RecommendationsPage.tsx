import { Link } from 'react-router-dom';
import * as ui from './ui';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useI18n } from '../../i18n/I18nContext';
import { useAimResults } from './useAimResults';
import { formatDate, humanize, prettifySkillId } from './aimApi';

/** Port of Flutter progress/ui/pages/recommendations_page.dart (GET /aim/students/:id/recommendations). */
export function RecommendationsPage() {
  const { data, loading, error, reload } = useAimResults();
  const { t } = useI18n();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  // Backend returns active recommendations ordered by rank ASC.
  const recs = data.recommendations;

  return (
    <div className={ui.pageStack}>
      <ui.BackLink to="/progress">{t('Progress')}</ui.BackLink>
      <h1 className={ui.h1}>{t('Recommendations')}</h1>
      <p className={ui.intro}>{t('Personalized next steps from the AIM engine, most important first.')}</p>

      {recs.length === 0 ? (
        <EmptyState title={t('No recommendations')} message={t('Complete more lessons to get personalized recommendations.')} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {recs.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={ui.itemTitle} title={r.targetSkillId}>{prettifySkillId(r.targetSkillId)}</span>
                  <div className="flex flex-wrap gap-2">
                    <span className={ui.badge(ui.tone.primary)}>{humanize(r.kind)}</span>
                    <span className={ui.badge(ui.tone.neutral)}>#{r.rank}</span>
                  </div>
                </div>
                <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{humanize(r.reason)}</p>
                <p className={ui.meta}>
                  {t('Generated {date}', { date: formatDate(r.generatedAt) })}
                  {r.expiresAt ? ` · ${t('Expires {date}', { date: formatDate(r.expiresAt) })}` : ''}
                </p>
                {r.targetLessonId && (
                  <Link to={`/lessons/${r.targetLessonId}`} className={ui.linkLg}>{t('Open lesson')}</Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
