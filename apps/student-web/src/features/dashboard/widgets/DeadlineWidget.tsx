import { Link } from 'react-router-dom';
import { formatDateTime } from '../../../i18n';
import { useI18n } from '../../../i18n/I18nContext';
import { Card } from '../../../components/common/Card';
import { deadlineStatusLabel } from '../../assessments/assessmentsApi';
import type { StudentDeadlineItem } from '../dashboardApi';
import * as ui from './ui';

interface DeadlineWidgetProps {
  /** Soonest first. Null when the request failed: shown as "unavailable", never as "no deadlines". */
  deadlines: StudentDeadlineItem[] | null;
}

function formatDue(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : formatDateTime(d, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** "Due in 2 days" / "Due today" / "Overdue" for something still open. */
export function dueIn(iso: string, now = Date.now()): { key: 'overdue' | 'today' | 'tomorrow' | 'days'; days: number } {
  const ms = new Date(iso).getTime() - now;
  if (ms < 0) return { key: 'overdue', days: 0 };
  const days = Math.floor(ms / 86_400_000);
  return days === 0 ? { key: 'today', days } : days === 1 ? { key: 'tomorrow', days } : { key: 'days', days };
}

const LIVE = new Set(['open', 'active', 'extended', 'late']);

export function DeadlineWidget({ deadlines }: DeadlineWidgetProps) {
  const { t } = useI18n();
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className={ui.cardTitle}>{t('Upcoming deadlines')}</h3>
          <Link to="/assessments" className={ui.link}>{t('All assessments')}</Link>
        </div>
        {deadlines === null ? (
          <p className="m-0 text-sm text-ink-muted">{t('Could not load {what}.', { what: t('deadlines') })}</p>
        ) : deadlines.length === 0 ? (
          <p className="m-0 text-sm leading-relaxed text-ink-muted">{t('You have no upcoming deadlines.')}</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {deadlines.map((d) => {
              const live = LIVE.has(d.status);
              const due = live ? dueIn(d.extendedClosesAt ?? d.closesAt) : null;
              const urgent = !!due && (due.key !== 'days' || due.days <= 2);
              return (
                <li key={d.deadlineId}>
                  <Link to={`/assessments/${d.assessmentId}`} className="flex flex-col gap-1 rounded-xl bg-surface-sunken p-3 no-underline transition-colors hover:bg-brand-soft">
                    <span className="flex items-center justify-between gap-2">
                      <span className={d.status === 'late' ? 'text-xs font-extrabold uppercase tracking-wider text-warning-ink' : ui.eyebrow}>{deadlineStatusLabel(d.status)}</span>
                      {due && (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${urgent ? 'bg-danger-soft text-danger-ink' : 'bg-surface-muted text-ink-soft'}`}>
                          {due.key === 'overdue' ? t('Overdue') : due.key === 'today' ? t('Due today') : due.key === 'tomorrow' ? t('Due tomorrow') : t('Due in {n} days', { n: due.days })}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-bold leading-snug text-ink [unicode-bidi:plaintext]">{d.assessmentTitle}</span>
                    <span className="text-xs font-medium text-ink-muted">
                      {d.status === 'upcoming' ? t('Opens {date}', { date: formatDue(d.opensAt) }) : t('Due {date}', { date: formatDue(d.extendedClosesAt ?? d.closesAt) })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
