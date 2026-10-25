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
import styles from './Reports.module.css';

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
    <div className={styles.chartSection}>
      <h3 className={styles.sectionTitle}>{section.title}</h3>
      {rows.length === 0 ? (
        <p className={styles.muted}>No data for this section yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>{columns.map(c => <th key={c} scope="col">{humanize(c)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>{columns.map(c => <td key={c}>{formatCell(row?.[c])}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <div className={styles.container}>
      <h1 className={styles.heading}>My Reports</h1>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports available"
          message="There are no reports available to you yet."
        />
      ) : (
        <div className={styles.timelineList}>
          {reports.map(report => {
            const state = runs[report.key];
            const run = state?.run ?? null;
            const result = run?.status === 'completed' ? run.resultData : null;
            return (
              <Card key={report.id}>
                <div className={styles.reportCard}>
                  <div className={styles.reportHeader}>
                    <div className={styles.reportTitleBlock}>
                      <h2 className={styles.sectionTitle}>{report.name}</h2>
                      <span className={styles.categoryPill}>{humanize(report.category)}</span>
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
                  {report.description && <p className={styles.muted}>{report.description}</p>}

                  {state?.running && <LoadingSpinner />}
                  {state?.error && <Banner variant="error">{state.error}</Banner>}
                  {run?.status === 'failed' && (
                    <Banner variant="error">{run.errorMessage || 'This report could not be generated.'}</Banner>
                  )}
                  {result && (
                    <div className={styles.reportResult}>
                      <span className={styles.muted}>
                        Generated {new Date(result.generatedAt).toLocaleString()}
                      </span>
                      {result.sections.length === 0 ? (
                        <p className={styles.muted}>This report has no data yet.</p>
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
