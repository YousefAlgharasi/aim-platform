import { PageTitleBar } from '../../components/common/PageTitleBar';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ListSkeleton } from '../../components/common/Skeleton';
import { useI18n } from '../../i18n/I18nContext';
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
  const { t, plural } = useI18n();
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {items.map((r) => (
        <Card key={r.scheduleId}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={ui.itemTitle} title={r.skillId}>{prettifySkillId(r.skillId)}</span>
              <span className={ui.badge(statusTone(r.status))}>{humanize(r.status)}</span>
            </div>
            <span className="text-[15px] font-bold text-ink">{dueLabel(r.dueAt)}</span>
            <p className={ui.meta}>
              {t('Every {interval}', { interval: formatInterval(r.intervalDays) })} ·{' '}
              {plural(r.repetitionCount, {
                one: t('Reviewed {n} time', { n: r.repetitionCount }),
                two: t('Reviewed {n} times [two]', { n: r.repetitionCount }),
                few: t('Reviewed {n} times [few]', { n: r.repetitionCount }),
                other: t('Reviewed {n} times', { n: r.repetitionCount }),
              })}
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
  const { t } = useI18n();
  const { data, loading, error, reload } = useAimResults();

  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const now = Date.now();
  const open = data.reviewSchedules.filter((r) => r.status !== 'completed').sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  const dueNow = open.filter((r) => new Date(r.dueAt).getTime() <= now);
  const later = open.filter((r) => new Date(r.dueAt).getTime() > now);
  const done = data.reviewSchedules.filter((r) => r.status === 'completed');

  return (
    <div className={`${ui.pageStack} stagger`}>
      <PageTitleBar title={t('Review schedule')} subtitle={t('Spaced-repetition reviews scheduled for you to keep skills fresh.')} fallback="/progress" />

      {data.reviewSchedules.length === 0 ? (
        <EmptyState title={t('No reviews scheduled')} message={t('Reviews are scheduled automatically as you practice skills.')} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[[dueNow.length, t('Due now'), dueNow.length > 0 ? 'text-warning-ink' : 'text-ink'], [later.length, t('Upcoming'), 'text-ink'], [done.length, t('Completed'), 'text-success-ink']].map(([n, label, tone]) => (
              <div key={String(label)} className="rounded-2xl bg-surface p-4 text-center ring-1 ring-line">
                <span className={`block text-3xl font-semibold tabular-nums tracking-tight ${tone}`}>{n}</span>
                <span className="text-xs font-semibold text-ink-muted">{label}</span>
              </div>
            ))}
          </div>
          {dueNow.length > 0 && (
            <section className="flex flex-col gap-3" aria-label={t('Due now')}>
              <h2 className={`${ui.sectionTitle} px-1`}>{t('Due now')}</h2>
              <ReviewList items={dueNow} />
            </section>
          )}
          <section className="flex flex-col gap-3" aria-label={t('Upcoming')}>
            <h2 className={`${ui.sectionTitle} px-1`}>{t('Upcoming')}</h2>
            {later.length === 0 ? <p className={ui.meta}>{t('Nothing to review right now.')}</p> : <ReviewList items={later} />}
          </section>
          {done.length > 0 && (
            <section className="flex flex-col gap-3" aria-label={t('Completed')}>
              <h2 className={`${ui.sectionTitle} px-1`}>{t('Completed')}</h2>
              <ReviewList items={done} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
