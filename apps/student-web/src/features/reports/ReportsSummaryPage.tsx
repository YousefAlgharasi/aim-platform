import { useState, useEffect, useCallback, useRef } from 'react';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  fetchReportDefinitions,
  runReport,
  fetchReportRun,
  type ReportDefinition,
  type ReportRun,
  type ReportSection,
} from './reportsApi';
import { PageHeader, h2Cls, subCls, pillCls } from '../profile/ui';

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 30;

interface RunState {
  run: ReportRun | null;
  running: boolean;
  error: string;
}

function humanize(key: string): string {
  const s = key.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) return d.toLocaleString();
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(formatCell).join(', ');
  return JSON.stringify(value);
}

function SectionView({ section }: { section: ReportSection }) {
  const rows = Array.isArray(section.data) ? section.data : [];
  const columns = Array.from(new Set(rows.flatMap(r => Object.keys(r ?? {}))));
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white m-0">{section.title}</h3>
      {rows.length === 0 ? (
        <p className={subCls}>No data for this section yet.</p>
      ) : (
        <>
          {/* Phones: card list */}
          <div className="sm:hidden flex flex-col gap-2.5">
            {rows.map((row, i) => (
              <dl key={i} className="m-0 rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3.5 flex flex-col gap-1.5">
                {columns.map(c => (
                  <div key={c} className="flex items-start justify-between gap-3 text-sm">
                    <dt className="text-slate-500 dark:text-slate-400">{humanize(c)}</dt>
                    <dd className="m-0 font-semibold text-slate-900 dark:text-white text-end break-words min-w-0">{formatCell(row?.[c])}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
          {/* Wider screens: table */}
          <div className="hidden sm:block overflow-x-auto rounded-xl ring-1 ring-[#E2E8F0] dark:ring-slate-700">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40">
                  {columns.map(c => (
                    <th key={c} scope="col" className="px-3.5 py-2.5 text-start text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {humanize(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {rows.map((row, i) => (
                  <tr key={i}>
                    {columns.map(c => (
                      <td key={c} className="px-3.5 py-2.5 text-slate-800 dark:text-slate-100">{formatCell(row?.[c])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function ReportsSummaryPage() {
  const [reports, setReports] = useState<ReportDefinition[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [runs, setRuns] = useState<Record<string, RunState>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const fetchReports = useCallback(() => {
    setLoading(true);
    setError('');
    fetchReportDefinitions()
      .then(setReports)
      .catch(err => setError(getErrorMessage(err, 'Failed to load reports')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
  }, []);

  function update(key: string, patch: Partial<RunState>) {
    const empty: RunState = { run: null, running: false, error: '' };
    setRuns(prev => ({ ...prev, [key]: { ...empty, ...prev[key], ...patch } }));
  }

  function poll(key: string, runId: string, attempt: number) {
    timers.current[key] = setTimeout(() => {
      fetchReportRun(runId)
        .then(run => {
          if (run.status === 'queued' || run.status === 'running') {
            if (attempt + 1 >= POLL_MAX_ATTEMPTS) {
              update(key, { run, running: false, error: 'The report is taking longer than expected. Try again shortly.' });
            } else {
              update(key, { run });
              poll(key, runId, attempt + 1);
            }
          } else {
            update(key, { run, running: false });
          }
        })
        .catch(err => update(key, { running: false, error: getErrorMessage(err, 'Failed to check report status') }));
    }, POLL_INTERVAL_MS);
  }

  function handleRun(report: ReportDefinition) {
    if (runs[report.key]?.running) return;
    clearTimeout(timers.current[report.key]);
    update(report.key, { running: true, error: '' });
    runReport(report.key)
      .then(run => {
        if (run.status === 'queued' || run.status === 'running') {
          update(report.key, { run });
          poll(report.key, run.id, 0);
        } else {
          update(report.key, { run, running: false });
        }
      })
      .catch(err => update(report.key, { running: false, error: getErrorMessage(err, 'Failed to run report') }));
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchReports} />;
  if (!reports) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Insights" title="My Reports" subtitle="Generate summaries of your learning activity." />

      {reports.length === 0 ? (
        <EmptyState
          title="No reports available"
          message="There are no reports available to you yet."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map(report => {
            const state = runs[report.key];
            const run = state?.run ?? null;
            const result = run?.status === 'completed' ? run.resultData : null;
            return (
              <Card key={report.id}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <h2 className={h2Cls}>{report.name}</h2>
                      <span><span className={pillCls}>{humanize(report.category)}</span></span>
                    </div>
                    <Button
                      variant={run ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleRun(report)}
                      disabled={!!state?.running}
                    >
                      {state?.running ? 'Generating…' : run ? 'Run again' : 'Generate report'}
                    </Button>
                  </div>
                  {report.description && <p className={subCls}>{report.description}</p>}

                  {state?.running && <LoadingSpinner />}
                  {state?.error && <Banner variant="error">{state.error}</Banner>}
                  {run?.status === 'failed' && (
                    <Banner variant="error">{run.errorMessage || 'This report could not be generated.'}</Banner>
                  )}
                  {result && (
                    <div className="flex flex-col gap-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-xs font-semibold text-slate-400">
                        Generated {new Date(result.generatedAt).toLocaleString()}
                      </span>
                      {result.sections.length === 0 ? (
                        <p className={subCls}>This report has no data yet.</p>
                      ) : (
                        result.sections.map((section, i) => <SectionView key={`${section.title}-${i}`} section={section} />)
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
