// P17-066: Admin support tickets UI
// Table: subject, requester, category, severity, status, assigned, created.
// Admin actions: change status, assign.
// Backend is the final authority for all ticket data.
'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { backendFetch } from '../../../../lib/api/client-api-helpers';

import { OperationsLoadingSpinner } from '../../../../components/operations/operations-loading-spinner';
import { OperationsEmptyState } from '../../../../components/operations/operations-empty-state';
import { OperationsErrorCard } from '../../../../components/operations/operations-error-card';

type SupportTicket = {
  readonly id: string;
  readonly subject: string;
  readonly requester: string;
  readonly category: string;
  readonly severity: string;
  readonly status: string;
  readonly assignedTo: string | null;
  readonly createdAt: string;
};

type TicketsResponse = {
  readonly data: readonly SupportTicket[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

const SEVERITY_CLASSES: Record<string, string> = {
  critical: 'ops-badge--error',
  high:     'ops-badge--warning',
  medium:   'ops-badge--info',
  low:      'ops-badge--neutral',
};

const STATUS_CLASSES: Record<string, string> = {
  open:        'ops-badge--primary',
  in_progress: 'ops-badge--info',
  resolved:    'ops-badge--success',
  closed:      'ops-badge--neutral',
};

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<readonly SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTickets = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch('/admin/support-tickets');
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const items: SupportTicket[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      setTickets(items);
      setTotal(items.length);
      setPage(1);
      setTotalPages(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load support tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets(1);
  }, [fetchTickets]);

  async function handleChangeStatus(ticketId: string, newStatus: string) {
    setActionLoading(ticketId);
    try {
      const res = await backendFetch(`/admin/support-tickets/${ticketId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
      await fetchTickets(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket status.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAssign(ticketId: string) {
    const assignee = prompt('Enter assignee user ID:');
    if (!assignee) return;
    setActionLoading(ticketId);
    try {
      const res = await backendFetch(`/admin/support-tickets/${ticketId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedTo: assignee }),
      });
      if (!res.ok) throw new Error(`Failed to assign ticket: ${res.statusText}`);
      await fetchTickets(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign ticket.');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <OperationsLoadingSpinner message="Loading support tickets..." />;
  }

  if (error) {
    return <OperationsErrorCard message={error} onRetry={() => fetchTickets(page)} />;
  }

  if (tickets.length === 0) {
    return (
      <div className="ops-tickets">
        <header className="ops-tickets-header">
          <p className="ops-eyebrow">Operations</p>
          <h1 className="ops-page-title">Support Tickets</h1>
        </header>
        <OperationsEmptyState message="No support tickets found." />
      </div>
    );
  }

  return (
    <div className="ops-tickets">
      <header className="ops-tickets-header">
        <p className="ops-eyebrow">Operations</p>
        <h1 className="ops-page-title">Support Tickets</h1>
        <p className="ops-page-meta">{total} ticket{total !== 1 ? 's' : ''}</p>
      </header>

      <div className="ops-table-wrapper" role="region" aria-label="Support tickets table">
        <table className="ops-table">
          <caption className="ops-table-caption">{total} support tickets</caption>
          <thead>
            <tr>
              <th className="ops-table-th" scope="col">Subject</th>
              <th className="ops-table-th" scope="col">Requester</th>
              <th className="ops-table-th" scope="col">Category</th>
              <th className="ops-table-th" scope="col">Severity</th>
              <th className="ops-table-th" scope="col">Status</th>
              <th className="ops-table-th" scope="col">Assigned</th>
              <th className="ops-table-th" scope="col">Created</th>
              <th className="ops-table-th" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="ops-table-row">
                <td className="ops-table-td ops-table-td--primary">{ticket.subject}</td>
                <td className="ops-table-td">{ticket.requester}</td>
                <td className="ops-table-td">{ticket.category}</td>
                <td className="ops-table-td">
                  <span className={`ops-badge ${SEVERITY_CLASSES[ticket.severity] ?? 'ops-badge--neutral'}`}>
                    {ticket.severity}
                  </span>
                </td>
                <td className="ops-table-td">
                  <span className={`ops-badge ${STATUS_CLASSES[ticket.status] ?? 'ops-badge--neutral'}`}>
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="ops-table-td">{ticket.assignedTo ?? '—'}</td>
                <td className="ops-table-td ops-table-td--date">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="ops-table-td ops-table-td--actions">
                  <select
                    className="ops-action-select"
                    value={ticket.status}
                    onChange={(e) => handleChangeStatus(ticket.id, e.target.value)}
                    disabled={actionLoading === ticket.id}
                    aria-label={`Change status for ${ticket.subject}`}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    className="ops-action-btn"
                    type="button"
                    onClick={() => handleAssign(ticket.id)}
                    disabled={actionLoading === ticket.id}
                    aria-label={`Assign ${ticket.subject}`}
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="ops-pagination" role="navigation" aria-label="Pagination">
          <button
            className="ops-pagination-btn"
            type="button"
            disabled={page <= 1}
            onClick={() => fetchTickets(page - 1)}
          >
            Previous
          </button>
          <span className="ops-pagination-info">Page {page} of {totalPages}</span>
          <button
            className="ops-pagination-btn"
            type="button"
            disabled={page >= totalPages}
            onClick={() => fetchTickets(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      <style>{`
        .ops-tickets { display: flex; flex-direction: column; gap: var(--space-24); }

        .ops-tickets-header { display: flex; flex-direction: column; gap: var(--space-4); }

        .ops-eyebrow {
          margin: 0; font-size: 12px; font-weight: var(--weight-semibold);
          text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);
        }

        .ops-page-title { margin: 0; font-size: 24px; font-weight: var(--weight-bold); color: var(--text-primary); }

        .ops-page-meta { margin: 0; font-size: 14px; color: var(--text-secondary); }

        .ops-table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--surface);
        }

        .ops-table { width: 100%; border-collapse: collapse; font-size: 13px; }

        .ops-table-caption { text-align: start; padding: var(--space-12) var(--space-16); font-size: 12px; color: var(--text-muted); }

        .ops-table-th {
          text-align: start; padding: var(--space-8) var(--space-16);
          font-size: 12px; font-weight: var(--weight-semibold);
          color: var(--text-secondary); border-bottom: 1px solid var(--border);
          white-space: nowrap; background: var(--surface-raised);
        }

        .ops-table-row { transition: background var(--duration-fast) var(--ease-standard); }
        .ops-table-row:hover { background: var(--state-hover); }

        .ops-table-td {
          padding: var(--space-8) var(--space-16); border-bottom: 1px solid var(--border);
          color: var(--text-primary); vertical-align: middle;
        }

        .ops-table-td--primary { font-weight: var(--weight-medium); }
        .ops-table-td--date { white-space: nowrap; color: var(--text-secondary); font-size: 12px; }
        .ops-table-td--actions { white-space: nowrap; display: flex; gap: var(--space-8); align-items: center; }

        .ops-badge {
          display: inline-flex; padding: 2px var(--space-8); border-radius: var(--radius-sm);
          font-size: 11px; font-weight: var(--weight-semibold); text-transform: capitalize;
        }
        .ops-badge--primary { background: var(--primary-soft); color: var(--color-primary-700); }
        .ops-badge--success { background: var(--success-soft); color: var(--color-success-700); }
        .ops-badge--warning { background: var(--warning-soft); color: var(--color-warning-700); }
        .ops-badge--error   { background: var(--error-soft);   color: var(--color-error-700); }
        .ops-badge--info    { background: var(--info-soft);    color: var(--color-info-700); }
        .ops-badge--neutral { background: var(--neutral-soft); color: var(--text-secondary); }

        .ops-action-select {
          height: var(--size-btn-sm); padding: 0 var(--space-8); border: 1px solid var(--border);
          border-radius: var(--radius-sm); font-size: 12px; font-family: inherit;
          background: var(--surface); color: var(--text-primary); cursor: pointer;
        }
        .ops-action-select:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

        .ops-action-btn {
          height: var(--size-btn-sm); padding: 0 var(--space-12); border: 1px solid var(--border);
          border-radius: var(--radius-sm); font-size: 12px; font-weight: var(--weight-medium);
          font-family: inherit; background: var(--surface); color: var(--color-primary-600);
          cursor: pointer; transition: background var(--duration-fast) var(--ease-standard);
        }
        .ops-action-btn:hover:not(:disabled) { background: var(--state-hover); }
        .ops-action-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .ops-action-btn:disabled { cursor: not-allowed; opacity: 0.5; }

        .ops-pagination {
          display: flex; align-items: center; justify-content: center; gap: var(--space-16);
        }
        .ops-pagination-btn {
          height: var(--size-btn-sm); padding: 0 var(--space-16); border: 1px solid var(--border);
          border-radius: var(--radius-md); font-size: 13px; font-family: inherit;
          background: var(--surface); color: var(--text-primary); cursor: pointer;
        }
        .ops-pagination-btn:disabled { cursor: not-allowed; opacity: 0.5; }
        .ops-pagination-btn:hover:not(:disabled) { background: var(--state-hover); }
        .ops-pagination-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .ops-pagination-info { font-size: 13px; color: var(--text-secondary); }

        @media (max-width: 768px) {
          .ops-table-th, .ops-table-td { padding: var(--space-4) var(--space-8); }
        }
      `}</style>
    </div>
  );
}
