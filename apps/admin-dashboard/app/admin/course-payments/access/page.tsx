// Students' paid course access. Each approved payment opens the course for
// a number of days; finishing in time marks it completed, running out of
// time marks it failed (the student must pay again and restart).
'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { AccessWindow, coursePaymentsApi, formatDate } from '../../../../features/course-payments/api';
import { StatusBadge } from '../../../../features/course-payments/course-payments-styles';
import { OperationsLoadingSpinner, OperationsErrorCard } from '../../../../shared/components/operations';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function timeLeft(w: AccessWindow): string {
  if (w.status !== 'active') return '—';
  const days = Math.ceil((new Date(w.expiresAt).getTime() - Date.now()) / DAY_MS);
  return days <= 0 ? 'Ending' : `${days} day${days === 1 ? '' : 's'}`;
}

export default function CourseAccessPage() {
  const [filter, setFilter] = useState('');
  const [items, setItems] = useState<AccessWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setItems(await coursePaymentsApi.listAccess(filter || undefined));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load course access.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="cp-page">
      <header className="cp-header">
        <p className="cp-eyebrow">Course payments</p>
        <h1 className="cp-title">Course Access</h1>
        <p className="cp-meta">Who has paid access to which course, and how long they have left to finish it.</p>
      </header>

      <div className="cp-tabs" role="group" aria-label="Filter access">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" className="cp-tab" aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <OperationsLoadingSpinner message="Loading course access..." />
      ) : loadError ? (
        <OperationsErrorCard message={loadError} onRetry={load} />
      ) : items.length === 0 ? (
        <div className="cp-empty">No course access yet. It appears here once you approve a payment.</div>
      ) : (
        <div className="cp-table-wrap">
          <table className="cp-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Status</th>
                <th>Started</th>
                <th>Deadline</th>
                <th>Time left</th>
              </tr>
            </thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div className="cp-strong">{w.studentName ?? w.studentEmail ?? w.studentId}</div>
                    {w.studentName && <div className="cp-muted">{w.studentEmail}</div>}
                  </td>
                  <td>{w.courseTitle}</td>
                  <td><StatusBadge status={w.status} /></td>
                  <td>{formatDate(w.startsAt)}</td>
                  <td>{formatDate(w.expiresAt)}</td>
                  <td>{w.status === 'completed' ? `Finished ${formatDate(w.completedAt)}` : timeLeft(w)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
