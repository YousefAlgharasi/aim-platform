'use client';

import { useState, useEffect } from 'react';
import { backendFetchJson } from '../../../../lib/api/client-api-helpers';

type ProviderEvent = {
  id: string;
  providerEventId: string;
  eventType: string;
  provider: string;
  processingStatus: string;
  errorMessage: string | null;
  processedAt: string | null;
  createdAt: string;
};

const STATUS_DOT: Record<string, string> = {
  pending: 'var(--color-warning-500, #f59e0b)',
  processed: 'var(--color-success-500)',
  failed: 'var(--color-error-500)',
  skipped: 'var(--text-muted)',
};

type StatusFilter = 'pending' | 'processed' | 'failed' | 'skipped';

export default function AdminProviderEventsPage() {
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [items, setItems] = useState<ProviderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    backendFetchJson<ProviderEvent[]>(`/admin/billing/provider-events?status=${filter}`)
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load events.'))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <section className="pe-page">
      <div className="pe-header">
        <div>
          <p className="pe-eyebrow">Billing</p>
          <h1 className="pe-title">Provider Events</h1>
          <p className="pe-subtitle">Webhook events from the payment provider.</p>
        </div>
      </div>

      <div className="pe-filters">
        {(['pending', 'processed', 'failed', 'skipped'] as StatusFilter[]).map((s) => (
          <button key={s} type="button" className={`pe-filter ${filter === s ? 'pe-filter--active' : ''}`}
            onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="pe-empty"><p className="pe-empty-title">No {filter} events</p><p className="pe-empty-desc">No provider events with status "{filter}" found.</p></div>
      )}

      {loading && <div className="pe-empty"><p className="pe-empty-desc">Loading…</p></div>}

      {!loading && items.length > 0 && (
        <div className="pe-table-wrap">
          <table className="pe-table">
            <thead>
              <tr>
                <th className="pe-th">Event ID</th>
                <th className="pe-th pe-th--type">Event Type</th>
                <th className="pe-th pe-th--provider">Provider</th>
                <th className="pe-th pe-th--status">Status</th>
                <th className="pe-th pe-th--date">Created</th>
                <th className="pe-th pe-th--err">Error</th>
              </tr>
            </thead>
            <tbody>
              {items.map((ev) => (
                <tr key={ev.id} className="pe-row">
                  <td className="pe-td"><code className="pe-id">{ev.providerEventId.slice(0, 16)}…</code></td>
                  <td className="pe-td pe-td--type">{ev.eventType}</td>
                  <td className="pe-td pe-td--provider">{ev.provider}</td>
                  <td className="pe-td">
                    <span className="pe-status">
                      <span className="pe-status-dot" style={{ background: STATUS_DOT[ev.processingStatus] ?? 'var(--text-muted)' }} />
                      {ev.processingStatus}
                    </span>
                  </td>
                  <td className="pe-td pe-td--date">{fmtDate(ev.createdAt)}</td>
                  <td className="pe-td pe-td--err">{ev.errorMessage ? <span className="pe-err" title={ev.errorMessage}>{ev.errorMessage.slice(0, 30)}…</span> : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .pe-page { display: flex; flex-direction: column; gap: 20px; }
        .pe-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .pe-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .pe-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .pe-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .pe-filters { display: flex; gap: 4px; border-bottom: 1px solid var(--border); padding-bottom: 0; }
        .pe-filter {
          padding: 8px 16px; border: none; background: none;
          font-size: 13px; font-weight: 600; color: var(--text-muted);
          cursor: pointer; font-family: inherit; border-bottom: 2px solid transparent;
          margin-bottom: -1px; text-transform: capitalize;
        }
        .pe-filter:hover { color: var(--text-primary); }
        .pe-filter--active { color: var(--color-primary-500); border-bottom-color: var(--color-primary-500); }
        .pe-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow-x: auto; }
        .pe-table { width: 100%; border-collapse: collapse; min-width: 650px; }
        .pe-th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); background: var(--surface-sunken); border-bottom: 1px solid var(--border); }
        .pe-th--type { width: 180px; }
        .pe-th--provider { width: 80px; }
        .pe-th--status { width: 100px; }
        .pe-th--date { width: 100px; }
        .pe-th--err { width: 180px; }
        .pe-row { transition: background 0.1s; }
        .pe-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .pe-row:not(:last-child) .pe-td { border-bottom: 1px solid var(--border); }
        .pe-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: middle; }
        .pe-td--type { font-size: 12px; font-weight: 500; }
        .pe-td--provider { font-size: 12px; color: var(--text-secondary); text-transform: capitalize; }
        .pe-td--date { font-size: 12px; color: var(--text-secondary); }
        .pe-td--err { font-size: 11px; }
        .pe-id { font-family: monospace; font-size: 11px; padding: 2px 6px; background: var(--surface-sunken); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); }
        .pe-status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize; }
        .pe-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .pe-err { color: var(--color-error-500); cursor: help; }
        .pe-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .pe-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .pe-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) { .pe-th--err, .pe-td--err { display: none; } }
      `}</style>
    </section>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return '--';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso)); } catch { return '--'; }
}
