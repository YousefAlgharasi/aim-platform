// P15-070: Parent Assessment Report UI
// Lists backend-approved assessment-category report definitions and lets
// the parent run one and view its status/result reference. Assessment
// outcomes themselves are computed entirely by ReportRunnerService — this
// page never grades, scores, or derives assessment results client-side.

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

const ASSESSMENT_CATEGORY = 'assessment';

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

function ParentAssessmentReport({ childId }) {
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
        const assessmentDefinitions = (data || []).filter(
          (def) => def.category === ASSESSMENT_CATEGORY,
        );
        setDefinitions(assessmentDefinitions);
        setStatus(assessmentDefinitions.length > 0 ? 'ready' : 'empty');
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
      const parameters = childId ? { childId } : {};
      const run = await runParentReport(reportKey, parameters);
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
    <div className="parent-assessment-report">
      <h2 className="parent-page__title">تقرير الاختبارات والتقييمات</h2>

      {status === 'empty' ? (
        <ParentEmptyState message="لا توجد تقارير تقييم متاحة حالياً." />
      ) : (
        <ParentCard title="تقارير التقييم المتاحة">
          <ParentTable
            columns={[
              { key: 'name', label: 'التقرير', render: (row) => row.name },
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
            emptyMessage="لا توجد تقارير تقييم متاحة حالياً."
          />
        </ParentCard>
      )}
    </div>
  );
}

export default ParentAssessmentReport;
