import { Link } from 'react-router-dom';
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
    : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function DeadlineWidget({ deadlines }: DeadlineWidgetProps) {
  if (deadlines.length === 0) {
    return (
      <Card>
        <EmptyState title="No deadlines" message="You have no upcoming deadlines." />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className={ui.cardTitle}>Upcoming deadlines</h3>
          <Link to="/assessments" className={ui.link}>All assessments</Link>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {deadlines.map((d) => (
            <li key={d.deadlineId} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
              <Link to={`/assessments/${d.assessmentId}`} className="flex min-w-0 flex-col gap-0.5 no-underline">
                <span className={d.status === 'late' ? 'text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400' : ui.eyebrow}>
                  {statusLabel[d.status] ?? d.status}
                </span>
                <span className="truncate text-sm font-bold text-slate-900 dark:text-white">{d.assessmentTitle}</span>
              </Link>
              <span className="shrink-0 text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                {d.status === 'upcoming' ? `Opens ${formatDue(d.opensAt)}` : `Due ${formatDue(d.extendedClosesAt ?? d.closesAt)}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
