'use client';

import { useState } from 'react';
import type { AdminReportDefinition, AdminReportRun } from '../../../../lib/api/admin-analytics-reports-api';

type Props = {
  readonly definitions: readonly AdminReportDefinition[];
  readonly runReport: (reportKey: string) => Promise<AdminReportRun>;
  readonly pollRunStatus: (runId: string) => Promise<AdminReportRun>;
};

const STATUS_DOT: Record<string, string> = {
  queued: 'var(--text-muted)',
  running: 'var(--color-warning-500, #f59e0b)',
  completed: 'var(--color-success-500)',
  failed: 'var(--color-error-500)',
};

export function ReportRunnerPanel({ definitions, runReport, pollRunStatus }: Props) {
  const [activeRuns, setActiveRuns] = useState<Record<string, AdminReportRun>>({});
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRun(reportKey: string) {
    setPendingKey(reportKey);
    setErrorMessage(null);
    try {
      const run = await runReport(reportKey);
      setActiveRuns((prev) => ({ ...prev, [reportKey]: run }));
      pollUntilSettled(reportKey, run.id);
    } catch {
      setErrorMessage(`Failed to start report "${reportKey}".`);
    } finally {
      setPendingKey(null);
    }
  }

  function pollUntilSettled(reportKey: string, runId: string) {
    const interval = setInterval(async () => {
      try {
        const run = await pollRunStatus(runId);
        setActiveRuns((prev) => ({ ...prev, [reportKey]: run }));
        if (run.status === 'completed' || run.status === 'failed') clearInterval(interval);
      } catch { clearInterval(interval); }
    }, 2000);
  }

  if (definitions.length === 0) {
    return (
      <div className="rp-empty">
        <p className="rp-empty-title">No report definitions available</p>
        <p className="rp-empty-desc">Report definitions will appear once configured in the backend.</p>
      </div>
    );
  }

  return (
    <div className="rp-root">
      {errorMessage && <div className="admin-error-banner" role="alert">{errorMessage}</div>}

      {definitions.map((def) => {
        const run = activeRuns[def.key];
        return (
          <div key={def.id} className="rp-card">
            <div className="rp-card-body">
              <p className="rp-card-title">{def.name}</p>
              {def.description && <p className="rp-card-desc">{def.description}</p>}
            </div>
            <div className="rp-card-actions">
              {run && (
                <span className="rp-status">
                  <span className="rp-status-dot" style={{ background: STATUS_DOT[run.status] ?? 'var(--text-muted)' }} />
                  {run.status}
                </span>
              )}
              <button type="button" className="rp-run-btn" onClick={() => handleRun(def.key)}
                disabled={pendingKey === def.key}>
                {pendingKey === def.key ? 'Starting…' : 'Run report'}
              </button>
            </div>
            {run?.errorMessage && <p className="rp-card-error">{run.errorMessage}</p>}
          </div>
        );
      })}

      <style>{`
        .rp-root { display: flex; flex-direction: column; gap: 12px; }
        .rp-card {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
          gap: 12px; padding: 18px 20px;
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
        }
        .rp-card-body { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 200px; }
        .rp-card-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .rp-card-desc { margin: 0; font-size: 13px; color: var(--text-secondary); }
        .rp-card-actions { display: flex; align-items: center; gap: 10px; }
        .rp-card-error { width: 100%; margin: 0; font-size: 13px; color: var(--color-error-500); }
        .rp-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize;
        }
        .rp-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .rp-run-btn {
          height: 34px; padding: 0 14px; border: 1px solid var(--border);
          border-radius: var(--radius-md); background: var(--surface);
          color: var(--text-secondary); font-size: 13px; font-weight: 500;
          font-family: inherit; cursor: pointer;
        }
        .rp-run-btn:hover { background: var(--surface-sunken); color: var(--text-primary); }
        .rp-run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rp-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .rp-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .rp-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
