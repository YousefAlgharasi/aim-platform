// P15-068: Parent Reporting UI
// Lists backend-approved analytics report definitions and lets the parent
// trigger and view the status/result reference of a report run. All report
// content, aggregation, and run state are backend-authoritative
// (ReportRunnerService / ReportDefinitionService) — this UI only renders
// what those services return.

import { useEffect, useState } from 'react';
import {
  listParentReportDefinitions,
  runParentReport,
  getParentReportRunStatus,
} from '../api';
import {
  ParentCard,
  ParentTable,
  ParentBadge,
  ParentLoadingState,
  ParentEmptyState,
  ParentErrorState,
} from '../components';
import './ParentPages.css';

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

function ParentAnalyticsReports() {
  const [definitions, setDefinitions] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [runningKey, setRunningKey] = useState(null);
  const [runs, setRuns] = useState({});

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    listParentReportDefinitions()
      .then((data) => {
        if (cancelled) return;
        setDefinitions(data || []);
        setStatus((data || []).length > 0 ? 'ready' : 'empty');
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

  async function handleRun(reportKey) {
    setRunningKey(reportKey);
    try {
      const run = await runParentReport(reportKey);
      setRuns((prev) => ({ ...prev, [reportKey]: run }));

      if (run.status === 'queued' || run.status === 'running') {
        const latest = await getParentReportRunStatus(run.id);
        setRuns((prev) => ({ ...prev, [reportKey]: latest }));
      }
    } catch (err) {
      setRuns((prev) => ({
        ...prev,
        [reportKey]: { status: 'failed', errorMessage: err.message },
      }));
    } finally {
      setRunningKey(null);
    }
  }

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;

  return (
    <div className="parent-analytics-reports">
      <h2 className="parent-page__title">التقارير التحليلية</h2>

      {status === 'empty' ? (
        <ParentEmptyState message="لا توجد تقارير متاحة حالياً." />
      ) : (
        <ParentCard title="التقارير المتاحة">
          <ParentTable
            columns={[
              { key: 'name', label: 'التقرير', render: (row) => row.name },
              { key: 'category', label: 'الفئة', render: (row) => row.category },
              {
                key: 'runStatus',
                label: 'حالة آخر تشغيل',
                render: (row) => {
                  const run = runs[row.key];
                  if (!run) return '—';
                  return (
                    <ParentBadge
                      label={STATUS_LABEL[run.status] || run.status}
                      variant={STATUS_VARIANT[run.status] || 'neutral'}
                    />
                  );
                },
              },
              {
                key: 'action',
                label: 'إجراء',
                render: (row) => (
                  <button
                    type="button"
                    className="parent-form__btn"
                    disabled={runningKey === row.key}
                    onClick={() => handleRun(row.key)}
                    aria-label={`تشغيل تقرير ${row.name}`}
                  >
                    {runningKey === row.key ? 'جاري التشغيل...' : 'تشغيل التقرير'}
                  </button>
                ),
              },
            ]}
            rows={definitions}
            emptyMessage="لا توجد تقارير متاحة حالياً."
          />
        </ParentCard>
      )}
    </div>
  );
}

export default ParentAnalyticsReports;
