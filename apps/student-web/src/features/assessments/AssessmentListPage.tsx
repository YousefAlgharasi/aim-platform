import { useState, useEffect, useCallback, useMemo } from 'react';
import { FilterPills } from '../../components/common/FilterPills';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { buttonClasses } from '../../components/common/buttonStyles';
import { ListSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ClipboardIcon, TrophyIcon } from '../../components/common/Icons';
import { deadlineStatusLabel, fetchAssessments, type AssessmentListItem } from './assessmentsApi';
import { useI18n } from '../../i18n/I18nContext';
import { statusTone, assessmentTypeLabel } from './assessmentUi';
import { Badge, PageHeader } from '../placement/ui';

const OPEN = new Set(['open', 'late', 'extended']);
type Filter = 'all' | 'quiz' | 'exam';

function Row({ a }: { a: AssessmentListItem }) {
  const { t } = useI18n();
  const isQuiz = a.type === 'quiz';
  const open = !!a.deadlineStatus && OPEN.has(a.deadlineStatus);
  return (
    <Link
      to={`/assessments/${a.id}`}
      className="group flex items-center gap-4 rounded-2xl bg-surface p-4 no-underline ring-1 ring-line transition-all duration-200 hover:ring-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none sm:p-5"
    >
      <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${isQuiz ? 'bg-brand-soft text-brand-ink' : 'bg-secondary-soft text-secondary-ink'}`} aria-hidden="true">
        {isQuiz ? <ClipboardIcon className="size-6" /> : <TrophyIcon className="size-6" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone={isQuiz ? 'indigo' : 'violet'}>{assessmentTypeLabel(a.type)}</Badge>
          {a.deadlineStatus && <Badge tone={statusTone(a.deadlineStatus)}>{deadlineStatusLabel(a.deadlineStatus)}</Badge>}
        </span>
        <span className="mt-1.5 block text-base font-bold leading-snug text-ink [unicode-bidi:plaintext]">{a.title}</span>
        {a.description && <span className="mt-0.5 line-clamp-2 block text-sm text-ink-muted [unicode-bidi:plaintext]">{a.description}</span>}
      </span>
      <span className={`hidden shrink-0 text-sm font-bold sm:block ${open ? 'text-brand-ink' : 'text-ink-muted'}`}>
        {open ? t('Take it') : t('View')} <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
      </span>
    </Link>
  );
}

function Section({ title, items }: { title: string; items: AssessmentListItem[] }) {
  const { t } = useI18n();
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3" aria-label={t(title)}>
      <h2 className="m-0 px-1 text-xl font-semibold tracking-tight text-ink">{t(title)} <span className="text-sm font-bold text-ink-muted">({items.length})</span></h2>
      <div className="flex flex-col gap-3">{items.map((a) => <Row key={a.id} a={a} />)}</div>
    </section>
  );
}

export function AssessmentListPage() {
  const { t } = useI18n();
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAssessments()
      .then((a) => setAssessments(a ?? []))
      .catch((err) => setError(getErrorMessage(err, t('Failed to load assessments'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => assessments.filter((a) => filter === 'all' || (filter === 'quiz' ? a.type === 'quiz' : a.type !== 'quiz')), [assessments, filter]);
  const openNow = filtered.filter((a) => a.deadlineStatus && OPEN.has(a.deadlineStatus));
  const upcoming = filtered.filter((a) => a.deadlineStatus === 'upcoming');
  const rest = filtered.filter((a) => !openNow.includes(a) && !upcoming.includes(a));
  const next = assessments.find((a) => a.deadlineStatus && OPEN.has(a.deadlineStatus));

  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchAll} />;

  return (
    <div className="stagger flex w-full flex-col gap-6">
      <PageHeader
        title={t('Assessments')}
        action={<Link to="/assessments/deadlines" className={`${buttonClasses('secondary', 'sm')} shrink-0`}>{t('Deadlines')}</Link>}
      />

      {assessments.length === 0 ? (
        <EmptyState title={t('No assessments')} message={t('Assessments will appear here when available.')} />
      ) : (
        <>
          <div className="hero-panel">
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="m-0 text-xs font-bold text-on-brand">{next ? t('Up next') : t('Nothing due')}</p>
                <p className="m-0 mt-1 text-xl font-semibold leading-snug [unicode-bidi:plaintext] sm:text-2xl">
                  {next ? next.title : t('You have no open assessments right now.')}
                </p>
              </div>
              {next && (
                <Link to={`/assessments/${next.id}`} className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl hero-cta px-6 text-[15px] font-bold no-underline transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  {t('Take it')}
                </Link>
              )}
            </div>
          </div>

          <FilterPills label={t('Filter assessments')} value={filter} onChange={setFilter}
            options={[{ key: 'all', label: t('All') }, { key: 'quiz', label: t('Quizzes') }, { key: 'exam', label: t('Exams') }] as const} />

          {filtered.length === 0 && <p className="m-0 py-6 text-center text-sm text-ink-muted">{t('Nothing matches this filter.')}</p>}
          <Section title="Open now" items={openNow} />
          <Section title="Coming up" items={upcoming} />
          <Section title="Past" items={rest} />
        </>
      )}
    </div>
  );
}
