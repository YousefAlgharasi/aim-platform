// P15-069: Parent Progress Report UI
// Runs the backend "learning-progress" report definition and renders its
// run status/result reference. Progress figures themselves are computed
// entirely by ReportRunnerService — this page never derives or estimates
// progress percentages from raw data.

import { useEffect, useState } from 'react';
import {
  runParentReport,
  getParentReportRunStatus,
} from '../api';
import {
  ParentCard,
  ParentBadge,
  ParentLoadingState,
  ParentEmptyState,
  ParentErrorState,
} from '../components';
import './ParentPages.css';

const PROGRESS_REPORT_KEY = 'learning-progress';

const STATUS_VARIANT = {
  queued: 'info',
  running: 'info',
  completed: 'success',
  failed: 'error',
};

const STATUS_LABEL = {
  queued: 'قيد الانتظار',
  running: 'قيد التنفيذ',
  completed: 'مكتمل',
  failed: 'فشل',
};

function ParentProgressReport({ childId }) {
  const [run, setRun] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setStatus('loading');
      try {
        const parameters = childId ? { childId } : {};
        const started = await runParentReport(PROGRESS_REPORT_KEY, parameters);
        if (cancelled) return;

        let latest = started;
        if (started.status === 'queued' || started.status === 'running') {
          latest = await getParentReportRunStatus(started.id);
        }
        if (cancelled) return;

        setRun(latest);
        setStatus(latest ? 'ready' : 'empty');
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      }
    }

    start();
    return () => {
      cancelled = true;
    };
  }, [childId]);

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;

  return (
    <div className="parent-progress-report">
      <h2 className="parent-page__title">تقرير التقدم الدراسي</h2>

      {status === 'empty' || !run ? (
        <ParentEmptyState message="لا يوجد تقرير تقدم متاح حالياً." />
      ) : (
        <ParentCard title="حالة التقرير">
          <div className="parent-progress-report__status-row">
            <ParentBadge
              label={STATUS_LABEL[run.status] || run.status}
              variant={STATUS_VARIANT[run.status] || 'neutral'}
            />
          </div>

          {run.status === 'completed' && run.resultRef && (
            <p className="parent-text--muted">مرجع النتيجة: {run.resultRef}</p>
          )}

          {run.status === 'failed' && run.errorMessage && (
            <p className="parent-progress-report__error" role="alert">{run.errorMessage}</p>
          )}
        </ParentCard>
      )}
    </div>
  );
}

export default ParentProgressReport;
