// P15-060: shared report-runner panel — triggers a backend report run and
// polls run status. Never computes report output itself.
'use client';

import { useState } from 'react';

import { AdminButton, AdminStatusBadge } from '../common';
import type { AdminReportDefinition, AdminReportRun } from '../../lib/api/admin-analytics-reports-api';

type Props = {
  readonly basePath: string;
  readonly definitions: readonly AdminReportDefinition[];
  readonly runReport: (reportKey: string) => Promise<AdminReportRun>;
  readonly pollRunStatus: (runId: string) => Promise<AdminReportRun>;
};

export function AdminReportRunnerPanel({ definitions, runReport, pollRunStatus }: Props) {
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
      setErrorMessage(`Failed to start report "${reportKey}". Check backend connectivity.`);
    } finally {
      setPendingKey(null);
    }
  }

  function pollUntilSettled(reportKey: string, runId: string) {
    const interval = setInterval(async () => {
      try {
        const run = await pollRunStatus(runId);
        setActiveRuns((prev) => ({ ...prev, [reportKey]: run }));
        if (run.status === 'completed' || run.status === 'failed') {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 2000);
  }

  if (definitions.length === 0) {
    return <p className="aim-report-runner-empty">No report definitions are visible for this role yet.</p>;
  }

  return (
    <div className="aim-report-runner-panel">
      {errorMessage && (
        <p className="admin-error-banner" role="alert">
          {errorMessage}
        </p>
      )}
      {definitions.map((definition) => {
        const run = activeRuns[definition.key];
        return (
          <div className="aim-report-runner-row" key={definition.id}>
            <div className="aim-report-runner-row-text">
              <p className="aim-report-runner-row-title">{definition.name}</p>
              {definition.description && (
                <p className="aim-report-runner-row-description">{definition.description}</p>
              )}
            </div>
            <div className="aim-report-runner-row-actions">
              {run && <AdminStatusBadge status={run.status} />}
              <AdminButton
                size="sm"
                variant="secondary"
                loading={pendingKey === definition.key}
                onClick={() => handleRun(definition.key)}
              >
                Run report
              </AdminButton>
            </div>
            {run?.errorMessage && <p className="aim-report-runner-row-error">{run.errorMessage}</p>}
          </div>
        );
      })}
      <style>{`
        .aim-report-runner-panel { display: flex; flex-direction: column; gap: var(--space-12); }
        .aim-report-runner-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-12);
          padding: var(--space-16);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }
        .aim-report-runner-row-text { display: flex; flex-direction: column; gap: var(--space-4); }
        .aim-report-runner-row-title {
          margin: 0;
          font-size: 15px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
        }
        .aim-report-runner-row-description { margin: 0; font-size: 13px; color: var(--text-secondary); }
        .aim-report-runner-row-actions { display: flex; align-items: center; gap: var(--space-8); }
        .aim-report-runner-row-error { width: 100%; margin: 0; font-size: 13px; color: var(--color-error-700); }
        .aim-report-runner-empty { margin: 0; color: var(--text-muted); font-size: 14px; }
      `}</style>
    </div>
  );
}
