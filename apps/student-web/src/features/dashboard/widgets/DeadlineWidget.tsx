import { Link } from 'react-router-dom';
import { formatDateTime } from '../../../i18n';
import { useI18n } from '../../../i18n/I18nContext';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import type { StudentDeadlineItem } from '../dashboardApi';
import * as ui from './ui';

interface DeadlineWidgetProps {
  /** Backend-grouped deadlines; status is backend-derived and shown as-is. */
  deadlines: StudentDeadlineItem[];
}

const statusLabel: Record<string, string> = {
  upcoming: 'Upcoming',
  active: 'Open',
  late: 'Late',
  missed: 'Missed',
  closed: 'Closed',
};

function formatDue(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : formatDateTime(d, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function DeadlineWidget({ deadlines }: DeadlineWidgetProps) {
  const { t } = useI18n();
  if (deadlines.length === 0) {
    return (
      <Card>
        <EmptyState title={t('No deadlines')} message={t('You have no upcoming deadlines.')} />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className={ui.cardTitle}>{t('Upcoming deadlines')}</h3>
          <Link to="/assessments" className={ui.link}>{t('All assessments')}</Link>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {deadlines.map((d) => (
            <li key={d.deadlineId} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
              <Link to={`/assessments/${d.assessmentId}`} className="flex min-w-0 flex-col gap-0.5 no-underline">
                <span className={d.status === 'late' ? 'text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400' : ui.eyebrow}>
                  {statusLabel[d.status] ? t(statusLabel[d.status]) : d.status}
                </span>
                <span className="text-sm font-bold leading-snug text-slate-900 dark:text-white [unicode-bidi:plaintext]">{d.assessmentTitle}</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {d.status === 'upcoming'
                    ? t('Opens {date}', { date: formatDue(d.opensAt) })
                    : t('Due {date}', { date: formatDue(d.extendedClosesAt ?? d.closesAt) })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
