'use client';

import { useState } from 'react';
import { createExportAction, pollExportStatusAction } from './actions';
import type { AdminExportJob, ExportType } from '../../../../lib/api/admin-analytics-exports-api';

const EXPORT_FORMATS: { value: ExportType; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'pdf', label: 'PDF' },
];

const STATUS_DOT: Record<string, string> = {
  queued: 'var(--text-muted)',
  processing: 'var(--color-warning-500, #f59e0b)',
  completed: 'var(--color-success-500)',
  failed: 'var(--color-error-500)',
};

export function ExportsClient() {
  const [reportRunId, setReportRunId] = useState('');
  const [exportType, setExportType] = useState<ExportType>('csv');
  const [jobs, setJobs] = useState<AdminExportJob[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!reportRunId.trim()) { setError('Report Run ID is required.'); return; }
    setIsPending(true);
    setError(null);
    try {
      const job = await createExportAction(reportRunId.trim(), exportType);
      setJobs((prev) => [job, ...prev]);
      setReportRunId('');
      pollUntilSettled(job.id);
    } catch {
      setError('Failed to request export. Check that the report run ID is valid.');
    } finally {
      setIsPending(false);
    }
  }

  function pollUntilSettled(jobId: string) {
    const interval = setInterval(async () => {
      try {
        const job = await pollExportStatusAction(jobId);
        setJobs((prev) => prev.map((j) => j.id === jobId ? job : j));
        if (job.status === 'completed' || job.status === 'failed') clearInterval(interval);
      } catch { clearInterval(interval); }
    }, 3000);
  }

  return (
    <div className="exc-root">
      <div className="exc-form-card">
        <h2 className="exc-form-title">Request Export</h2>
        <p className="exc-form-desc">Enter a completed report run ID to export its results.</p>
        {error && <div className="admin-error-banner" role="alert">{error}</div>}
        <form onSubmit={handleRequest} className="exc-form">
          <div className="exc-form-row">
            <div className="exc-field exc-field--grow">
              <label htmlFor="exc-run-id" className="exc-label">Report Run ID</label>
              <input id="exc-run-id" type="text" value={reportRunId} onChange={(e) => setReportRunId(e.target.value)}
                placeholder="Paste the report run ID here" disabled={isPending} className="exc-input" />
            </div>
            <div className="exc-field">
              <label htmlFor="exc-format" className="exc-label">Format</label>
              <select id="exc-format" value={exportType} onChange={(e) => setExportType(e.target.value as ExportType)}
                disabled={isPending} className="exc-select">
                {EXPORT_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <button type="submit" disabled={isPending} className="exc-submit">
              {isPending ? 'Requesting…' : 'Export'}
            </button>
          </div>
        </form>
      </div>

      {jobs.length > 0 && (
        <>
          <h2 className="exc-section-title">Export Jobs</h2>
          <div className="exc-table-wrap">
            <table className="exc-table">
              <thead>
                <tr>
                  <th className="exc-th">Job ID</th>
                  <th className="exc-th exc-th--format">Format</th>
                  <th className="exc-th exc-th--status">Status</th>
                  <th className="exc-th exc-th--date">Requested</th>
                  <th className="exc-th exc-th--file">File</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="exc-row">
                    <td className="exc-td"><code className="exc-id">{job.id.slice(0, 12)}…</code></td>
                    <td className="exc-td exc-td--format">
                      <span className="exc-format-pill">{job.exportType.toUpperCase()}</span>
                    </td>
                    <td className="exc-td">
                      <span className="exc-status">
                        <span className="exc-status-dot" style={{ background: STATUS_DOT[job.status] ?? 'var(--text-muted)' }} />
                        {job.status}
                      </span>
                    </td>
                    <td className="exc-td exc-td--date">{fmtDate(job.createdAt)}</td>
                    <td className="exc-td exc-td--file">
                      {job.status === 'completed' && job.fileRef
                        ? <span className="exc-file-ready">Ready</span>
                        : job.status === 'failed'
                        ? <span className="exc-file-error" title={job.errorMessage ?? undefined}>Error</span>
                        : <span className="exc-muted">--</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {jobs.length === 0 && (
        <div className="exc-empty">
          <p className="exc-empty-title">No exports yet</p>
          <p className="exc-empty-desc">Run a report from any report category, then use its run ID to export the results.</p>
        </div>
      )}

      <style>{`
        .exc-root { display: flex; flex-direction: column; gap: 20px; }
        .exc-form-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 20px;
        }
        .exc-form-title { margin: 0 0 4px; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .exc-form-desc { margin: 0 0 16px; font-size: 13px; color: var(--text-secondary); }
        .exc-form { display: flex; flex-direction: column; gap: 12px; }
        .exc-form-row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
        .exc-field { display: flex; flex-direction: column; gap: 4px; }
        .exc-field--grow { flex: 1; min-width: 200px; }
        .exc-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
        .exc-input, .exc-select {
          height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
          background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit;
        }
        .exc-input:focus, .exc-select:focus {
          outline: none; border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
        }
        .exc-select { min-width: 90px; }
        .exc-submit {
          height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap;
        }
        .exc-submit:hover:not(:disabled) { background: var(--color-primary-600); }
        .exc-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .exc-section-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .exc-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .exc-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .exc-th {
          text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);
          background: var(--surface-sunken); border-bottom: 1px solid var(--border);
        }
        .exc-th--format { width: 80px; }
        .exc-th--status { width: 110px; }
        .exc-th--date { width: 110px; }
        .exc-th--file { width: 80px; }
        .exc-row { transition: background 0.1s; }
        .exc-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .exc-row:not(:last-child) .exc-td { border-bottom: 1px solid var(--border); }
        .exc-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: middle; }
        .exc-td--format { font-size: 12px; }
        .exc-td--date { font-size: 12px; color: var(--text-secondary); }
        .exc-td--file { font-size: 12px; }
        .exc-id {
          font-family: monospace; font-size: 11px; padding: 2px 6px;
          background: var(--surface-sunken); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-secondary);
        }
        .exc-format-pill {
          display: inline-block; padding: 2px 8px; border-radius: var(--radius-sm);
          border: 1px solid var(--border); font-size: 11px; font-weight: 600; color: var(--text-secondary);
        }
        .exc-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize;
        }
        .exc-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .exc-file-ready { color: var(--color-success-500); font-weight: 600; font-size: 12px; }
        .exc-file-error { color: var(--color-error-500); font-weight: 500; font-size: 12px; cursor: help; }
        .exc-muted { color: var(--text-muted); }
        .exc-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .exc-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .exc-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) {
          .exc-form-row { flex-direction: column; align-items: stretch; }
          .exc-th--file, .exc-td--file { display: none; }
        }
      `}</style>
    </div>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return '--';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso));
  } catch { return '--'; }
}
