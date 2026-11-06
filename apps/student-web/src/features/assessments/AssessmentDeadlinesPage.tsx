import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { ListSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  deadlineStatusLabel,
  fetchAssessmentDeadlines,
  type StudentDeadlineItem,
  type StudentDeadlines,
} from './assessmentsApi';
import { useI18n } from '../../i18n/I18nContext';
import { statusTone } from './assessmentUi';
import { Badge, CARD, PageHeader } from '../placement/ui';

// Bucket order and titles follow the Flutter DeadlinesPage. Grouping is backend-computed.
const GROUPS: Array<{ key: keyof StudentDeadlines; title: string }> = [
  { key: 'active', title: 'Open now' },
  { key: 'late', title: 'Late submission window' },
  { key: 'upcoming', title: 'Upcoming' },
  { key: 'missed', title: 'Missed' },
  { key: 'closed', title: 'Closed' },
];

/** "Due in 2 days" / "Due today" / "Overdue" for something still open. */
function dueIn(iso: string, t: (s: string, p?: Record<string, string | number>) => string): { text: string; urgent: boolean } {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms < 0) return { text: t('Overdue'), urgent: true };
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return { text: t('Due today'), urgent: true };
  return { text: days === 1 ? t('Due tomorrow') : t('Due in {n} days', { n: days }), urgent: days <= 2 };
}

function DeadlineCard({ item }: { item: StudentDeadlineItem }) {
  const { t, formatDateTime } = useI18n();
  const closesAt = item.extendedClosesAt ?? item.closesAt;
  const live = item.status === 'open' || item.status === 'late' || item.status === 'extended';
  const due = live ? dueIn(closesAt, t) : null;
  return (
    <Link
      to={`/assessments/${item.assessmentId}`}
      className="flex flex-col gap-2.5 rounded-2xl bg-surface p-4 no-underline ring-1 ring-line transition-all duration-200 hover:ring-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={statusTone(item.status)}>{deadlineStatusLabel(item.status)}</Badge>
        {item.extendedClosesAt && <Badge tone="indigo">{t('Extended')}</Badge>}
        {due && <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${due.urgent ? 'bg-danger-soft text-danger-ink' : 'bg-surface-muted text-ink-soft'}`}>{due.text}</span>}
      </div>
      <h3 className="m-0 text-base font-bold leading-snug text-ink">{item.assessmentTitle}</h3>
      <p className="m-0 text-xs font-medium text-ink-muted">
        {item.status === 'upcoming' ? (
          <>{t('Opens {date}', { date: formatDateTime(item.opensAt) })}</>
        ) : (
          <>
            {item.status === 'closed' || item.status === 'missed' || item.status === 'expired'
              ? t('Closed {date}', { date: formatDateTime(closesAt) })
              : t('Due {date}', { date: formatDateTime(closesAt) })}
          </>
        )}
      </p>
    </Link>
  );
}

export function AssessmentDeadlinesPage() {
  const { t } = useI18n();
  const [deadlines, setDeadlines] = useState<StudentDeadlines | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAssessmentDeadlines()
      .then(setDeadlines)
      .catch((err) => setError(getErrorMessage(err, t('Failed to load deadlines'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!deadlines) return null;

  const total = GROUPS.reduce((n, g) => n + deadlines[g.key].length, 0);

  return (
    <div className="stagger flex w-full flex-col gap-6">
      <PageHeader
        fallback="/assessments"
        title={t('Deadlines')}
      />
      {total === 0 ? (
        <EmptyState title={t('No deadlines')} message={t("You don't have any assessment deadlines right now.")} />
      ) : (
        GROUPS.filter((g) => deadlines[g.key].length > 0).map((g) => (
          <section key={g.key} className="flex flex-col gap-3">
            <h2 className="m-0 px-1 text-xl font-semibold tracking-tight text-ink">{t(g.title)} <span className="text-sm font-bold text-ink-muted">({deadlines[g.key].length})</span></h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {deadlines[g.key].map((item) => (
                <DeadlineCard key={`${item.deadlineId}-${item.assessmentId}`} item={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
