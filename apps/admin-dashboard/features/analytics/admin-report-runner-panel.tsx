// P15-060: shared report-runner panel — triggers a backend report run and
// polls run status. Never computes report output itself.
'use client';

import { useState } from 'react';

import { AdminButton, AdminStatusBadge } from '../../components/common';
import { AdminErrorBanner } from '../../components/layout';
import type { AdminReportDefinition, AdminReportRun } from './admin-analytics-reports-api';

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
    return <p className="text-sm text-[var(--text-muted)]">No report definitions are visible for this role yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {errorMessage && <AdminErrorBanner message={errorMessage} />}
      {definitions.map((definition) => {
        const run = activeRuns[definition.key];
        return (
          <div
            className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]"
            key={definition.id}
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{definition.name}</p>
              {definition.description && (
                <p className="text-xs text-[var(--text-secondary)]">{definition.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
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
            {run?.errorMessage && <p className="w-full text-xs text-red-700 mt-1">{run.errorMessage}</p>}
          </div>
        );
      })}
    </div>
  );
}
