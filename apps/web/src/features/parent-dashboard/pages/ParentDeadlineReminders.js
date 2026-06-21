// P13-064: Parent deadline reminder UI.
//
// Shows the parent's own deadline-type reminder schedules and lets them
// request pause/resume/cancel. The backend remains the final authority on
// schedule status, next run time, and whether a reminder actually fires.

import { useEffect, useState } from 'react';
import {
  getReminderSchedules,
  pauseReminderSchedule,
  resumeReminderSchedule,
  cancelReminderSchedule,
} from '../api';
import { ParentCard, ParentBadge, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

const STATUS_LABELS = {
  active: 'نشط',
  paused: 'متوقف مؤقتًا',
  completed: 'مكتمل',
  cancelled: 'ملغى',
};

const STATUS_VARIANTS = {
  active: 'success',
  paused: 'warning',
  completed: 'info',
  cancelled: 'neutral',
};

function ParentDeadlineReminders() {
  const [schedules, setSchedules] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getReminderSchedules()
      .then((data) => {
        if (cancelled) return;
        const items = (Array.isArray(data) ? data : []).filter((s) => s.kind === 'deadline');
        setSchedules(items);
        setStatus(items.length > 0 ? 'ready' : 'empty');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function applyAction(scheduleId, action) {
    try {
      const updated = await action(scheduleId);
      setSchedules((prev) => prev.map((s) => (s.id === scheduleId ? updated : s)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (status === 'empty') return <ParentEmptyState message="لا توجد تذكيرات بمواعيد نهائية." />;

  return (
    <div className="parent-deadline-status">
      <h2 className="parent-page__title">تذكيرات المواعيد النهائية</h2>
      <div className="parent-deadline-status__grid">
        {schedules.map((schedule) => {
          const scheduleStatus = schedule.status;
          const nextRunAt = schedule.nextRunAt || schedule.next_run_at;
          const isFinal = scheduleStatus === 'completed' || scheduleStatus === 'cancelled';
          return (
            <ParentCard key={schedule.id} title={schedule.cadence || 'تذكير'}>
              <div className="parent-deadline-status__row">
                {nextRunAt && <span>{nextRunAt}</span>}
                <ParentBadge
                  label={STATUS_LABELS[scheduleStatus] || scheduleStatus}
                  variant={STATUS_VARIANTS[scheduleStatus] || 'neutral'}
                />
              </div>
              {!isFinal && (
                <div className="parent-notifications__actions">
                  {scheduleStatus === 'active' && (
                    <button
                      type="button"
                      className="parent-btn"
                      onClick={() => applyAction(schedule.id, pauseReminderSchedule)}
                      aria-label={`إيقاف تذكير الموعد النهائي مؤقتًا: ${schedule.cadence || ''}`}
                    >
                      إيقاف مؤقت
                    </button>
                  )}
                  {scheduleStatus === 'paused' && (
                    <button
                      type="button"
                      className="parent-btn parent-btn--primary"
                      onClick={() => applyAction(schedule.id, resumeReminderSchedule)}
                      aria-label={`استئناف تذكير الموعد النهائي: ${schedule.cadence || ''}`}
                    >
                      استئناف
                    </button>
                  )}
                  <button
                    type="button"
                    className="parent-btn parent-btn--danger"
                    onClick={() => applyAction(schedule.id, cancelReminderSchedule)}
                    aria-label={`إلغاء تذكير الموعد النهائي: ${schedule.cadence || ''}`}
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </ParentCard>
          );
        })}
      </div>
    </div>
  );
}

export default ParentDeadlineReminders;
