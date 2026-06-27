'use client';

import { useState } from 'react';
import type { NotificationAuditLog, NotificationTemplate } from '../../../../../lib/api/admin-notification-analytics-api';

type Props = {
  readonly auditLogs: NotificationAuditLog[];
  readonly templates: NotificationTemplate[];
};

const STATUS_DOT: Record<string, string> = {
  sent: 'var(--color-success-500)',
  delivered: 'var(--color-success-500)',
  failed: 'var(--color-error-500)',
  pending: 'var(--color-warning-500, #f59e0b)',
  read: 'var(--color-primary-500)',
};

export function NotificationReportsClient({ auditLogs, templates }: Props) {
  const [tab, setTab] = useState<'logs' | 'templates'>('logs');

  return (
    <div className="nrc-root">
      <div className="nrc-tabs">
        <button type="button" className={`nrc-tab ${tab === 'logs' ? 'nrc-tab--active' : ''}`} onClick={() => setTab('logs')}>
          Audit Logs ({auditLogs.length})
        </button>
        <button type="button" className={`nrc-tab ${tab === 'templates' ? 'nrc-tab--active' : ''}`} onClick={() => setTab('templates')}>
          Templates ({templates.length})
        </button>
      </div>

      {tab === 'logs' && (
        <>
          {auditLogs.length === 0 ? (
            <div className="nrc-empty">
              <p className="nrc-empty-title">No audit logs</p>
              <p className="nrc-empty-desc">Notification audit logs will appear here as events are processed.</p>
            </div>
          ) : (
            <div className="nrc-table-wrap">
              <table className="nrc-table">
                <thead>
                  <tr>
                    <th className="nrc-th">Event Type</th>
                    <th className="nrc-th nrc-th--channel">Channel</th>
                    <th className="nrc-th nrc-th--status">Status</th>
                    <th className="nrc-th nrc-th--user">User ID</th>
                    <th className="nrc-th nrc-th--date">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="nrc-row">
                      <td className="nrc-td"><span className="nrc-event-type">{log.eventType.replace(/_/g, ' ')}</span></td>
                      <td className="nrc-td nrc-td--channel">{log.channel.replace(/_/g, ' ')}</td>
                      <td className="nrc-td">
                        <span className="nrc-status">
                          <span className="nrc-status-dot" style={{ background: STATUS_DOT[log.status] ?? 'var(--text-muted)' }} />
                          {log.status}
                        </span>
                      </td>
                      <td className="nrc-td nrc-td--user">
                        {log.userId ? <code className="nrc-uid">{log.userId.slice(0, 8)}…</code> : <span className="nrc-muted">--</span>}
                      </td>
                      <td className="nrc-td nrc-td--date">{fmtDate(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'templates' && (
        <>
          {templates.length === 0 ? (
            <div className="nrc-empty">
              <p className="nrc-empty-title">No templates</p>
              <p className="nrc-empty-desc">Notification templates will appear here once configured.</p>
            </div>
          ) : (
            <div className="nrc-table-wrap">
              <table className="nrc-table">
                <thead>
                  <tr>
                    <th className="nrc-th">Template</th>
                    <th className="nrc-th nrc-th--channel">Channel</th>
                    <th className="nrc-th nrc-th--subject">Subject</th>
                    <th className="nrc-th nrc-th--date">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((tpl) => (
                    <tr key={tpl.id} className="nrc-row">
                      <td className="nrc-td"><span className="nrc-tpl-name">{tpl.name}</span></td>
                      <td className="nrc-td nrc-td--channel">{tpl.channel.replace(/_/g, ' ')}</td>
                      <td className="nrc-td nrc-td--subject">{tpl.subject ?? <span className="nrc-muted">--</span>}</td>
                      <td className="nrc-td nrc-td--date">{fmtDate(tpl.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <style>{`
        .nrc-root { display: flex; flex-direction: column; gap: 14px; }
        .nrc-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); padding-bottom: 0; }
        .nrc-tab {
          padding: 8px 16px; border: none; background: none;
          font-size: 13px; font-weight: 600; color: var(--text-muted);
          cursor: pointer; font-family: inherit; border-bottom: 2px solid transparent;
          margin-bottom: -1px;
        }
        .nrc-tab:hover { color: var(--text-primary); }
        .nrc-tab--active { color: var(--color-primary-500); border-bottom-color: var(--color-primary-500); }
        .nrc-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .nrc-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .nrc-th {
          text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);
          background: var(--surface-sunken); border-bottom: 1px solid var(--border);
        }
        .nrc-th--channel { width: 100px; }
        .nrc-th--status { width: 100px; }
        .nrc-th--user { width: 120px; }
        .nrc-th--subject { width: 200px; }
        .nrc-th--date { width: 110px; }
        .nrc-row { transition: background 0.1s; }
        .nrc-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .nrc-row:not(:last-child) .nrc-td { border-bottom: 1px solid var(--border); }
        .nrc-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: top; }
        .nrc-td--channel { font-size: 12px; text-transform: capitalize; color: var(--text-secondary); }
        .nrc-td--user { font-size: 12px; }
        .nrc-td--subject { font-size: 13px; color: var(--text-secondary); }
        .nrc-td--date { font-size: 12px; color: var(--text-secondary); }
        .nrc-event-type { font-weight: 500; text-transform: capitalize; }
        .nrc-tpl-name { font-weight: 600; }
        .nrc-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize;
        }
        .nrc-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .nrc-uid {
          font-family: monospace; font-size: 11px; padding: 2px 6px;
          background: var(--surface-sunken); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-secondary);
        }
        .nrc-muted { color: var(--text-muted); }
        .nrc-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .nrc-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .nrc-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) {
          .nrc-th--user, .nrc-td--user, .nrc-th--subject, .nrc-td--subject { display: none; }
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
