// P17-067: Admin feedback UI
// Table: title, category, rating, status, source, created.
// Triage action: set status.
// Backend is the final authority for all feedback data.
'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { backendFetch } from '../../../../lib/api/client-api-helpers';

import { OperationsLoadingSpinner } from '../../../../components/operations/operations-loading-spinner';
import { OperationsEmptyState } from '../../../../components/operations/operations-empty-state';
import { OperationsErrorCard } from '../../../../components/operations/operations-error-card';

type FeedbackItem = {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly rating: number | null;
  readonly status: string;
  readonly source: string;
  readonly createdAt: string;
};

type FeedbackResponse = {
  readonly data: readonly FeedbackItem[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

const STATUS_CLASSES: Record<string, string> = {
  new:         'ops-badge--primary',
  reviewed:    'ops-badge--info',
  acknowledged:'ops-badge--success',
  archived:    'ops-badge--neutral',
  dismissed:   'ops-badge--neutral',
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<readonly FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFeedback = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch('/admin/feedback');
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const items: FeedbackItem[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      setFeedback(items);
      setTotal(items.length);
      setPage(1);
      setTotalPages(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback(1);
  }, [fetchFeedback]);

  async function handleSetStatus(feedbackId: string, newStatus: string) {
    setActionLoading(feedbackId);
    try {
      const res = await backendFetch(`/admin/feedback/${feedbackId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
      await fetchFeedback(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feedback status.');
    } finally {
      setActionLoading(null);
    }
  }

  function renderRating(rating: number | null) {
    if (rating === null) return <span className="ops-text-muted">—</span>;
    return (
      <span className="ops-rating" aria-label={`Rating: ${rating} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < rating ? 'ops-rating-star--filled' : 'ops-rating-star--empty'}>
            {i < rating ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  }

  if (loading) {
    return <OperationsLoadingSpinner message="Loading feedback..." />;
  }

  if (error) {
    return <OperationsErrorCard message={error} onRetry={() => fetchFeedback(page)} />;
  }

  if (feedback.length === 0) {
    return (
      <div className="ops-feedback">
        <header className="ops-feedback-header">
          <p className="ops-eyebrow">Operations</p>
          <h1 className="ops-page-title">Feedback</h1>
        </header>
        <OperationsEmptyState message="No feedback submissions found." />
      </div>
    );
  }

  return (
    <div className="ops-feedback">
      <header className="ops-feedback-header">
        <p className="ops-eyebrow">Operations</p>
        <h1 className="ops-page-title">Feedback</h1>
        <p className="ops-page-meta">{total} submission{total !== 1 ? 's' : ''}</p>
      </header>

      <div className="ops-table-wrapper" role="region" aria-label="Feedback table">
        <table className="ops-table">
          <caption className="ops-table-caption">{total} feedback submissions</caption>
          <thead>
            <tr>
              <th className="ops-table-th" scope="col">Title</th>
              <th className="ops-table-th" scope="col">Category</th>
              <th className="ops-table-th" scope="col">Rating</th>
              <th className="ops-table-th" scope="col">Status</th>
              <th className="ops-table-th" scope="col">Source</th>
              <th className="ops-table-th" scope="col">Created</th>
              <th className="ops-table-th" scope="col">Triage</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((item) => (
              <tr key={item.id} className="ops-table-row">
                <td className="ops-table-td ops-table-td--primary">{item.title}</td>
                <td className="ops-table-td">{item.category}</td>
                <td className="ops-table-td">{renderRating(item.rating)}</td>
                <td className="ops-table-td">
                  <span className={`ops-badge ${STATUS_CLASSES[item.status] ?? 'ops-badge--neutral'}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="ops-table-td">{item.source}</td>
                <td className="ops-table-td ops-table-td--date">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="ops-table-td">
                  <select
                    className="ops-action-select"
                    value={item.status}
                    onChange={(e) => handleSetStatus(item.id, e.target.value)}
                    disabled={actionLoading === item.id}
                    aria-label={`Set status for ${item.title}`}
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="archived">Archived</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
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
            onClick={() => fetchFeedback(page - 1)}
          >
            Previous
          </button>
          <span className="ops-pagination-info">Page {page} of {totalPages}</span>
          <button
            className="ops-pagination-btn"
            type="button"
            disabled={page >= totalPages}
            onClick={() => fetchFeedback(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      <style>{`
        .ops-feedback { display: flex; flex-direction: column; gap: var(--space-24); }
        .ops-feedback-header { display: flex; flex-direction: column; gap: var(--space-4); }

        .ops-eyebrow {
          margin: 0; font-size: 12px; font-weight: var(--weight-semibold);
          text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);
        }
        .ops-page-title { margin: 0; font-size: 24px; font-weight: var(--weight-bold); color: var(--text-primary); }
        .ops-page-meta { margin: 0; font-size: 14px; color: var(--text-secondary); }

        .ops-table-wrapper {
          overflow-x: auto; border: 1px solid var(--border);
          border-radius: var(--radius-lg); background: var(--surface);
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
        .ops-text-muted { color: var(--text-muted); }

        .ops-rating { display: inline-flex; gap: 1px; font-size: 14px; }
        .ops-rating-star--filled { color: var(--color-warning-500); }
        .ops-rating-star--empty { color: var(--color-neutral-300); }

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

        .ops-pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-16); }
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
