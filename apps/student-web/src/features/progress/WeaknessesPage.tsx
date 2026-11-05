import { PageTitleBar } from '../../components/common/PageTitleBar';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ListSkeleton } from '../../components/common/Skeleton';
import { useI18n } from '../../i18n/I18nContext';
import { useAimResults } from './useAimResults';
import { formatDate, humanize, prettifySkillId } from './aimApi';
import * as ui from './ui';

function severityTone(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return ui.tone.error;
    case 'developing':
      return ui.tone.warning;
    default:
      return ui.tone.neutral;
  }
}

function statusTone(status: string): string {
  switch (status.toLowerCase()) {
    case 'open':
      return ui.tone.error;
    case 'improving':
      return ui.tone.warning;
    case 'resolved':
      return ui.tone.success;
    default:
      return ui.tone.neutral;
  }
}

/** Port of Flutter progress/ui/pages/weakness_summary_page.dart (GET /aim/students/:id/weakness-records). */
export function WeaknessesPage() {
  const { t, plural } = useI18n();
  const { data, loading, error, reload } = useAimResults();

  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  // Backend already orders unresolved first.
  const records = data.weaknessRecords;

  return (
    <div className={ui.pageStack}>
      <PageTitleBar title={t('Areas to improve')} subtitle={t('Skills the AIM engine detected you are struggling with, based on your attempts.')} />

      {records.length === 0 ? (
        <EmptyState title={t('No weaknesses detected')} message={t('Great work — no areas to improve have been detected yet.')} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {records.map((w) => (
            <Card key={w.weaknessId}>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={ui.itemTitle} title={w.skillId}>{prettifySkillId(w.skillId)}</span>
                  <div className="flex flex-wrap gap-2">
                    <span className={ui.badge(severityTone(w.severity))}>{humanize(w.severity)}</span>
                    <span className={ui.badge(statusTone(w.status))}>{humanize(w.status)}</span>
                  </div>
                </div>
                <p className={ui.meta}>
                  {t('Detected {date}', { date: formatDate(w.detectedAt) })}
                  {w.resolvedAt ? ` · ${t('Resolved {date}', { date: formatDate(w.resolvedAt) })}` : ''}
                  {w.triggerAttemptIds.length > 0
                    ? ` · ${plural(w.triggerAttemptIds.length, {
                        one: t('Based on {n} attempt', { n: w.triggerAttemptIds.length }),
                        two: t('Based on {n} attempts [two]', { n: w.triggerAttemptIds.length }),
                        few: t('Based on {n} attempts [few]', { n: w.triggerAttemptIds.length }),
                        other: t('Based on {n} attempts', { n: w.triggerAttemptIds.length }),
                      })}`
                    : ''}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
