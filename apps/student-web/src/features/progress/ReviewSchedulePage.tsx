import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAimResults } from './useAimResults';
import { dueLabel, formatInterval, humanize, prettifySkillId, type ReviewScheduleEntry } from './aimApi';
import * as ui from './ui';

function statusTone(status: string): string {
  switch (status.toLowerCase()) {
    case 'due':
      return ui.tone.primary;
    case 'completed':
      return ui.tone.success;
    case 'rescheduled':
      return ui.tone.warning;
    default:
      return ui.tone.neutral;
  }
}

function ReviewList({ items }: { items: ReviewScheduleEntry[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {items.map((r) => (
        <Card key={r.scheduleId}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={ui.itemTitle} title={r.skillId}>{prettifySkillId(r.skillId)}</span>
              <span className={ui.badge(statusTone(r.status))}>{humanize(r.status)}</span>
            </div>
            <span className="text-[15px] font-bold text-slate-900 dark:text-white">{dueLabel(r.dueAt)}</span>
            <p className={ui.meta}>
              Every {formatInterval(r.intervalDays)} · Reviewed {r.repetitionCount} time{r.repetitionCount === 1 ? '' : 's'}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Port of Flutter progress/ui/pages/review_schedule_page.dart + reviews/ui/pages/review_page.dart
 * (GET /aim/students/:id/review-schedules). Due dates/intervals are backend-computed.
 */
export function ReviewSchedulePage() {
  const { data, loading, error, reload } = useAimResults();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const open = data.reviewSchedules.filter((r) => r.status !== 'completed');
  const done = data.reviewSchedules.filter((r) => r.status === 'completed');

  return (
    <div className={ui.pageStack}>
      <ui.BackLink to="/progress">Progress</ui.BackLink>
      <h1 className={ui.h1}>Review schedule</h1>
      <p className={ui.intro}>Spaced-repetition reviews scheduled for you to keep skills fresh.</p>

      {data.reviewSchedules.length === 0 ? (
        <EmptyState title="No reviews scheduled" message="Reviews are scheduled automatically as you practice skills." />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className={ui.sectionTitle}>Upcoming</h2>
            {open.length === 0 ? <p className={ui.meta}>Nothing to review right now.</p> : <ReviewList items={open} />}
          </section>
          {done.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className={ui.sectionTitle}>Completed</h2>
              <ReviewList items={done} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
