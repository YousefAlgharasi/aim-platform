import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
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

function DeadlineCard({ item }: { item: StudentDeadlineItem }) {
  const { t, formatDateTime } = useI18n();
  const closesAt = item.extendedClosesAt ?? item.closesAt;
  return (
    <Link
      to={`/assessments/${item.assessmentId}`}
      className={`${CARD} p-4 sm:p-5 flex flex-col gap-2.5 no-underline hover:ring-[#C7D2FE] dark:hover:ring-indigo-700 hover:shadow-md transition-all duration-200`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={statusTone(item.status)}>{deadlineStatusLabel(item.status)}</Badge>
        {item.extendedClosesAt && <Badge tone="indigo">{t('Extended')}</Badge>}
      </div>
      <h3 className="m-0 text-base font-bold leading-snug text-slate-900 dark:text-white">{item.assessmentTitle}</h3>
      <p className="m-0 text-xs font-medium text-slate-500 dark:text-slate-400">
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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!deadlines) return null;

  const total = GROUPS.reduce((n, g) => n + deadlines[g.key].length, 0);

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-5">
      <PageHeader
        eyebrow={t('Assessments')}
        title={t('Deadlines')}
        subtitle={t('Everything that is open, upcoming or past due.')}
        backTo="/assessments"
        backLabel={t('All assessments')}
      />
      {total === 0 ? (
        <EmptyState title={t('No deadlines')} message={t("You don't have any assessment deadlines right now.")} />
      ) : (
        GROUPS.filter((g) => deadlines[g.key].length > 0).map((g) => (
          <section key={g.key} className="flex flex-col gap-3">
            <h2 className="m-0 px-1 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t(g.title)}</h2>
            <div className="grid gap-3 md:grid-cols-2">
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
